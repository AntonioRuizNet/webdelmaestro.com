const MAX_OUTPUT_TOKENS = 1000;

export async function askArticleRecommender({ message, context = [], candidates, traceId }) {
  const saasUrl = process.env.SAAS_IA_API_URL;
  const saasKey = process.env.SAAS_IA_API_KEY;
  if (!saasUrl || !saasKey) throw new Error("El servicio de recomendaciones no está configurado");

  const payload = {
    model: "gpt-4.1-mini",
    input: JSON.stringify({
      role: "Sistema recomendador de Web del Maestro",
      userMessage: message,
      conversationContext: context,
      instructions: [
        "Usa únicamente los recursos incluidos en candidates.",
        "No inventes títulos, enlaces, edades, actividades ni recursos.",
        "Pregunta solo un dato imprescindible si no puedes orientar la búsqueda.",
        "Si puedes recomendar, selecciona entre 3 y 5 resourceId existentes; si hay menos candidatos, selecciona los disponibles.",
        "El campo intro debe ser una única frase breve, directa y de un máximo de 120 caracteres.",
        "Devuelve exclusivamente JSON válido, sin Markdown ni HTML.",
      ],
      responseFormat: {
        needsFollowUp: "boolean",
        followUpQuestion: "string | null",
        intro: "string",
        recommendations: [{ resourceId: "string", reason: "string" }],
        tips: ["string"],
      },
      candidates,
    }),
    max_output_tokens: MAX_OUTPUT_TOKENS,
  };
  const endpoint = `${saasUrl.replace(/\/$/, "")}/v1/responses`;
  const startedAt = Date.now();
  console.log(`[recommendations][${traceId || "no-trace"}] saas.request`, {
    endpoint: new URL(endpoint).origin,
    candidateCount: candidates.length,
    messageLength: message.length,
  });

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${saasKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (cause) {
    const error = new Error("No se pudo conectar con SaaS IA");
    error.cause = cause;
    error.step = "saas.fetch";
    throw error;
  }

  console.log(`[recommendations][${traceId || "no-trace"}] saas.response`, {
    status: response.status,
    durationMs: Date.now() - startedAt,
  });
  if (!response.ok) {
    const upstreamBody = (await response.text()).replace(/\s+/g, " ").slice(0, 500);
    const error = new Error("SaaS IA respondió con un estado no válido");
    error.step = "saas.response";
    error.upstreamStatus = response.status;
    error.upstreamBody = upstreamBody;
    throw error;
  }
  try {
    return await response.json();
  } catch (cause) {
    const error = new Error("SaaS IA no devolvió JSON válido");
    error.cause = cause;
    error.step = "saas.json";
    throw error;
  }
}

export function extractResponseText(response) {
  return response?.output
    ?.flatMap((item) => item?.content || [])
    .filter((item) => item?.type === "output_text")
    .map((item) => item?.text || "")
    .join("") || "";
}
