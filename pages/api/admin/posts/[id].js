import { requireEditorRole } from "@/lib/auth";
import { getPostByIdAdmin, updatePostAdmin, deletePostAdmin, slugExists } from "@/lib/db";

export default async function handler(req, res) {
  const session = await requireEditorRole(req, res);
  if (!session) return;

  const { id } = req.query;
  const postId = Number(id);
  if (!postId) return res.status(400).json({ error: "Invalid id" });

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

      if (data.slug) {
        const exists = await slugExists(data.slug, postId);
        if (exists) return res.status(409).json({ error: "Slug already exists" });
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
