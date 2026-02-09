import { requireEditorRole } from "@/lib/auth";
import { slugExists } from "@/lib/db";

function toInt(value) {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === undefined || v === null || v === "") return null;
  const n = Number.parseInt(String(v), 10);
  return Number.isInteger(n) ? n : null;
}

export default async function handler(req, res) {
  const session = await requireEditorRole(req, res);
  if (!session) return;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slugRaw = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
  const slug = typeof slugRaw === "string" ? slugRaw.trim() : "";

  if (!slug) {
    return res.status(400).json({ error: "slug is required" });
  }

  const excludeId = toInt(req.query.excludeId);
  if (req.query.excludeId != null && excludeId === null) {
    return res.status(400).json({ error: "excludeId must be an integer" });
  }

  try {
    const exists = await slugExists(slug, excludeId);
    return res.status(200).json({ exists });
  } catch (e) {
    console.error("GET /api/admin/posts/check-slug error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
