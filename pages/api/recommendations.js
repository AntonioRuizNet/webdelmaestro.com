import { findRecommendationCandidates } from "@/lib/article-recommender";
import { askArticleRecommender, extractResponseText } from "@/lib/saas-ia";

const MAX_MESSAGE_LENGTH = 700;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requestsByIp = new Map();

function createTraceId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function trace(traceId, step, details = {}) {
  console.log(`[recommendations][${traceId}] ${step}`, details);
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestsByIp.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  requestsByIp.set(ip, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function cleanText(value, maximum = 400) {
  return typeof value === "string" ? value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, maximum) : "";
}

function detectFilters(message) {
  const text = message.toLocaleLowerCase("es");
  const filters = [];
  if (/\b\d{1,2}\s*años?\b/.test(text)) filters.push("edad");
  if (/infantil|primaria|secundaria|eso/.test(text)) filters.push("etapa");
  if (/lecto|letra|sílaba|silaba|vocabulario/.test(text)) filters.push("lectoescritura");
  if (/mate|suma|resta|multiplica|número|numero/.test(text)) filters.push("matemáticas");
  if (/comprensión|comprension|lectora/.test(text)) filters.push("comprensión lectora");
  if (/imprim|descarg|pdf/.test(text)) filters.push("imprimible");
  return filters;
}

function parseProviderRecommendation(text, candidates) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || typeof parsed.needsFollowUp !== "boolean" || !Array.isArray(parsed.recommendations)) {
    throw new Error("Respuesta de recomendaciones no válida");
  }
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const recommendations = [];
  for (const item of parsed.recommendations) {
    const candidate = candidateById.get(String(item?.resourceId || ""));
    if (candidate && !recommendations.some((result) => result.id === candidate.id)) {
      recommendations.push({ ...candidate, reason: cleanText(item.reason, 280) || "Coincide con tu búsqueda." });
    }
    if (recommendations.length === 5) break;
  }
  const needsFollowUp = parsed.needsFollowUp;
  const visibleRecommendations = needsFollowUp ? [] : recommendations;
  const shortageNotice = !needsFollowUp && visibleRecommendations.length > 0 && visibleRecommendations.length < 3
    ? ` He encontrado ${visibleRecommendations.length} ficha${visibleRecommendations.length === 1 ? "" : "s"} que coincide${visibleRecommendations.length === 1 ? "" : "n"} claramente; puedes afinar por edad, etapa o contenido para ver alternativas cercanas.`
    : "";
  return {
    needsFollowUp,
    followUpQuestion: needsFollowUp ? cleanText(parsed.followUpQuestion, 220) || "¿Para qué edad o etapa buscas la actividad?" : null,
    intro: (cleanText(parsed.intro, 140) || (visibleRecommendations.length ? "Estas fichas pueden encajar con lo que buscas." : "No he encontrado una coincidencia exacta.")) + shortageNotice,
    recommendations: visibleRecommendations,
    tips: Array.isArray(parsed.tips) ? parsed.tips.map((tip) => cleanText(tip, 180)).filter(Boolean).slice(0, 3) : [],
  };
}

export default async function handler(req, res) {
  const traceId = createTraceId();
  res.setHeader("X-Recommendation-Trace-Id", traceId);
  trace(traceId, "request.received", { method: req.method });
  if (req.method !== "POST") {
    trace(traceId, "request.rejected", { reason: "method_not_allowed" });
    return res.status(405).json({ error: "Método no permitido" });
  }
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    trace(traceId, "request.rejected", { reason: "rate_limited" });
    return res.status(429).json({ error: "Has hecho muchas consultas. Prueba de nuevo en un minuto." });
  }

  const message = cleanText(req.body?.message, MAX_MESSAGE_LENGTH);
  const context = Array.isArray(req.body?.context) ? req.body.context.map((item) => cleanText(item, 240)).filter(Boolean).slice(-5) : [];
  if (message.length < 3) {
    trace(traceId, "request.rejected", { reason: "message_too_short", messageLength: message.length });
    return res.status(400).json({ error: "Escribe qué tipo de ficha necesitas." });
  }
  const detectedFilters = detectFilters([...context, message].join(" "));
  trace(traceId, "request.validated", { messageLength: message.length, contextCount: context.length, detectedFilters });

  try {
    const catalogStartedAt = Date.now();
    trace(traceId, "catalog.search.started");
    const candidates = await findRecommendationCandidates([...context, message].join(" "));
    trace(traceId, "catalog.search.completed", { candidateCount: candidates.length, durationMs: Date.now() - catalogStartedAt });
    if (!candidates.length) {
      trace(traceId, "response.completed", { outcome: "no_candidates" });
      return res.status(200).json({
        needsFollowUp: false,
        intro: "No he encontrado una ficha que coincida lo suficiente. Puedes probar con una materia, una letra o una edad concreta.",
        recommendations: [],
        tips: ["También puedes explorar las fichas imprimibles desde el buscador de la web."],
        detectedFilters,
      });
    }
    trace(traceId, "saas.selection.started", { candidateCount: candidates.length });
    const providerResponse = await askArticleRecommender({ message, context, candidates, traceId });
    trace(traceId, "saas.selection.completed", { outputItems: Array.isArray(providerResponse?.output) ? providerResponse.output.length : 0 });
    trace(traceId, "provider.response.parse.started");
    const result = parseProviderRecommendation(extractResponseText(providerResponse), candidates);
    trace(traceId, "provider.response.parse.completed", { needsFollowUp: result.needsFollowUp, recommendationCount: result.recommendations.length });
    trace(traceId, "response.completed", { outcome: "recommendations" });
    return res.status(200).json({ ...result, detectedFilters });
  } catch (error) {
    console.error(`[recommendations][${traceId}] request.failed`, {
      step: error?.step || "unknown",
      message: error?.message || "Error desconocido",
      upstreamStatus: error?.upstreamStatus || null,
      upstreamBody: error?.upstreamBody || null,
      cause: error?.cause?.message || null,
    });
    return res.status(503).json({
      error: "Ahora mismo no puedo preparar recomendaciones. Puedes usar el buscador de Web del Maestro mientras tanto.",
    });
  }
}
