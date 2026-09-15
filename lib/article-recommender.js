import { getAllStaticArticles } from "@/data/staticArticles";
import { sql } from "@/lib/db";

const SITE_ORIGIN = "https://webdelmaestro.com";
const STOP_WORDS = new Set(["a", "al", "con", "de", "del", "el", "en", "es", "la", "las", "lo", "los", "para", "por", "que", "un", "una", "y"]);

function plainText(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value = "") {
  return [...new Set(plainText(value).toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z0-9ñ]+/g) || [])]
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    .slice(0, 8);
}

function isAllowedUrl(value, { image = false } = {}) {
  if (!value) return false;
  if (String(value).startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "webdelmaestro.com" || (image && url.hostname === "media.webdelmaestro.com"));
  } catch {
    return false;
  }
}

function inferAge(text) {
  const match = plainText(text).match(/(\d{1,2})\s*(?:a|–|-)\s*(\d{1,2})\s*años/i);
  return match ? `${match[1]}-${match[2]} años` : undefined;
}

function inferStage(text) {
  if (/educación infantil|\binfantil\b/i.test(text)) return "Infantil";
  if (/educación primaria|\bprimaria\b/i.test(text)) return "Educación Primaria";
  if (/secundaria|\beso\b/i.test(text)) return "Secundaria";
  return undefined;
}

function toCandidate(post) {
  const staticArticle = post.staticArticle;
  const text = [post.title, post.excerpt, post.meta_description, staticArticle?.topic?.name, ...(staticArticle?.keywords || [])].filter(Boolean).join(" ");
  const slug = String(post.slug || "").replace(/^\/+/, "");
  const url = isAllowedUrl(post.url) ? post.url : slug ? `${SITE_ORIGIN}/${slug}` : null;

  if (!url || !post.id || !post.title) return null;
  return {
    id: String(post.id),
    title: plainText(post.title).slice(0, 180),
    url,
    image: isAllowedUrl(post.featured_image, { image: true }) ? post.featured_image : undefined,
    excerpt: plainText(post.excerpt || post.meta_description).slice(0, 280) || undefined,
    age: inferAge(text),
    stage: inferStage(text),
    subjects: [staticArticle?.topic?.name, ...(staticArticle?.keywords || [])].filter(Boolean).slice(0, 5) || undefined,
    tags: staticArticle?.keywords?.slice(0, 8) || undefined,
  };
}

function score(candidate, searchTokens) {
  const text = [candidate.title, candidate.excerpt, candidate.stage, ...(candidate.subjects || []), ...(candidate.tags || [])]
    .join(" ")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return searchTokens.reduce((total, token) => total + (text.includes(token) ? 1 : 0), 0);
}

export async function findRecommendationCandidates(message, limit = 24) {
  const searchTokens = tokens(message);
  const staticCandidates = getAllStaticArticles().map(toCandidate).filter(Boolean);
  let databaseCandidates = [];

  if (searchTokens.length) {
    const terms = searchTokens.map((term) => `%${term}%`);
    const rows = await sql`
      SELECT id, url, slug, title, excerpt, meta_description, featured_image
      FROM posts
      WHERE is_published = true
        AND CONCAT_WS(' ', title, excerpt, meta_description) ILIKE ANY(${terms}::text[])
      ORDER BY published_at DESC NULLS LAST
      LIMIT ${limit}
    `;
    databaseCandidates = rows.map(toCandidate).filter(Boolean);
  }

  const unique = new Map();
  [...databaseCandidates, ...staticCandidates].forEach((candidate) => unique.set(candidate.id, candidate));
  return [...unique.values()]
    .map((candidate) => ({ candidate, score: score(candidate, searchTokens) }))
    .filter(({ score: candidateScore }) => !searchTokens.length || candidateScore > 0)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title, "es"))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
