import { searchPosts } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed, use GET" });
  }

  try {
    const { term: rawTerm = "", column = "title", limit = "12", random = "0" } = req.query;

    // Normalizamos term
    let term = "";
    if (typeof rawTerm === "string") {
      const t = rawTerm.trim();
      term = t === "*" ? "a" : t; // "*" => sin filtro real
    }

    const max = Math.min(parseInt(limit, 10) || 12, 50);
    const randomBool = random === "1" || random === "true";

    let exclude = req.query.exclude || [];
    if (!Array.isArray(exclude)) {
      exclude = [exclude];
    }

    const posts = await searchPosts({
      term,
      column,
      limit: max,
      random: randomBool,
      exclude,
    });

    return res.status(200).json({ posts });
  } catch (err) {
    console.error("Error en /api/getPosts:", err, req.query);
    return res.status(500).json({ error: "Error interno en getPosts" });
  }
}
