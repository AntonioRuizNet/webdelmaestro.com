import { requireEditorRole } from "@/lib/auth";
import { listPostsAdmin, createPostAdmin, slugExists } from "@/lib/db";

export default async function handler(req, res) {
  const session = await requireEditorRole(req, res);
  if (!session) return;

  if (req.method === "GET") {
    try {
      const { q = "", status = "all", limit = "20", offset = "0" } = req.query;
      const posts = await listPostsAdmin({
        q: typeof q === "string" ? q : "",
        status: typeof status === "string" ? status : "all",
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
      });
      return res.status(200).json({ posts });
    } catch (e) {
      console.error("GET /api/admin/posts error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  if (req.method === "POST") {
    try {
      const data = req.body || {};
      if (!data.slug || !data.title) {
        return res.status(400).json({ error: "slug and title are required" });
      }
      const exists = await slugExists(data.slug);
      if (exists) {
        return res.status(409).json({ error: "Slug already exists" });
      }

      const created = await createPostAdmin({
        ...data,
        author: session?.user?.name || null,
      });

      return res.status(201).json({ ok: true, post: created });
    } catch (e) {
      console.error("POST /api/admin/posts error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
