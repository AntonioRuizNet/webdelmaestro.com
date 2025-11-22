import { getServerSession } from "next-auth/next";
import authHandler from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authHandler);
  if (!session) return res.status(401).json({ message: "Unauthorized" });
  return res.status(200).json({ user: session.user });
}
