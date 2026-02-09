import { requireEditorRole } from "@/lib/auth";
import { slugExists } from "@/lib/db";

export default async function handler(req, res) {
  const session = await requireEditorRole(req, res);
  if (!session) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug = "", excludeId = null } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "slug is required" });
  }

  try {
    const exists = await slugExists(slug, excludeId ? Number(excludeId) : null);
    return res.status(200).json({ exists });
  } catch (e) {
    console.error("GET /api/admin/posts/check-slug error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
