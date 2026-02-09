import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

/**
 * Require an authenticated session for API routes.
 */
export async function requireSession(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return session;
}

/**
 * Require session + role (admin/editor) for content management.
 */
export async function requireEditorRole(req, res) {
  const session = await requireSession(req, res);
  if (!session) return null;

  const role = session?.user?.role;
  if (role !== "admin" && role !== "editor") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return session;
}
