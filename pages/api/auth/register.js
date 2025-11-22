import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    const { email, username, password } = req.body || {};
    if (!email || !username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true }
    });
    if (exists) return res.status(409).json({ message: "Email or username already in use" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true, createdAt: true }
    });
    return res.status(201).json({ ok: true, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal error" });
  }
}
