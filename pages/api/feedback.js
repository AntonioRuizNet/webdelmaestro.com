import nodemailer from "nodemailer";

const attempts = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Método no permitido." }); }
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (message.length < 3 || message.length > 2000) return res.status(400).json({ error: "Escribe una opinión de entre 3 y 2000 caracteres." });
  const recipient = process.env.FEEDBACK_EMAIL_TO || process.env.SMTP_USER;
  if (!recipient || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return res.status(503).json({ error: "El envío no está disponible." });
  const ip = req.socket.remoteAddress || "unknown";
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.reset <= now) attempts.delete(key);
  const entry = attempts.get(ip) || { count: 0, reset: now + 60 * 60 * 1000 };
  if (entry.count >= 5) return res.status(429).json({ error: "Demasiados intentos. Inténtalo más tarde." });
  entry.count += 1;
  attempts.set(ip, entry);
  try {
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || "587", 10), secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await transport.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to: recipient, subject: "Opinión sobre Web del Maestro", text: message });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Feedback email failed:", error.message);
    return res.status(503).json({ error: "No se ha podido enviar la opinión." });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };
