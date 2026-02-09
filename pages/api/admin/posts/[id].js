import { requireEditorRole } from "@/lib/auth";
import { getPostByIdAdmin, updatePostAdmin, deletePostAdmin, slugExists } from "@/lib/db";

function toInt(value) {
  const v = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(String(v), 10);
  return Number.isInteger(n) ? n : null;
}

export default async function handler(req, res) {
  const session = await requireEditorRole(req, res);
  if (!session) return;

  const postId = toInt(req.query.id);
  if (postId === null) return res.status(400).json({ error: "Invalid id" });

  if (req.method === "GET") {
    try {
      const post = await getPostByIdAdmin(postId);
      if (!post) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ post });
    } catch (e) {
      console.error("GET /api/admin/posts/[id] error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const data = req.body || {};

      // Si viene slug, validarlo como string
      if (data.slug != null) {
        const s = String(data.slug).trim();
        if (!s) return res.status(400).json({ error: "slug cannot be empty" });

        const exists = await slugExists(s, postId); // postId YA ES int
        if (exists) return res.status(409).json({ error: "Slug already exists" });

        data.slug = s;
      }

      const saved = await updatePostAdmin(postId, {
        ...data,
        author: session?.user?.name || null,
      });

      return res.status(200).json({ ok: true, post: saved });
    } catch (e) {
      console.error("PUT /api/admin/posts/[id] error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await deletePostAdmin(postId);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("DELETE /api/admin/posts/[id] error:", e);
      return res.status(500).json({ error: "Internal error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
