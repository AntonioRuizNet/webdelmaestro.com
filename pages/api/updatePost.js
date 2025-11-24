// pages/api/updatePost.js
import { upsertPostByUrl } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  try {
    const data = req.body;

    if (!data || !data.url) {
      return res.status(400).json({ error: "Falta url en el cuerpo de la petición" });
    }

    const saved = await upsertPostByUrl(data);

    return res.status(200).json({
      ok: true,
      id: saved.id,
      url: saved.url,
      slug: saved.slug,
    });
  } catch (err) {
    console.error("Error en /api/updatePost:", err);
    return res.status(500).json({ error: "Error interno en updatePost" });
  }
}
