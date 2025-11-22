import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetEmail } from "@/utils/mailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email is required" });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond OK to prevent user enumeration
    if (!user) return res.status(200).json({ message: "If the email exists, a reset link has been sent." });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry }
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    try {
      await sendResetEmail(email, resetLink);
    } catch (e) {
      console.warn("Email send failed, but token saved:", e.message);
    }
    return res.status(200).json({ message: "If the email exists, a reset link has been sent." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal error" });
  }
}
