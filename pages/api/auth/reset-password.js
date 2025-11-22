import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: "Token and password are required" });
  try {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } }
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null }
    });
    return res.status(200).json({ ok: true, message: "Password updated" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal error" });
  }
}
