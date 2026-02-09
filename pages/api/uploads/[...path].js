import fs from "fs";
import path from "path";

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

export default function handler(req, res) {
  try {
    const parts = Array.isArray(req.query.path) ? req.query.path : [];
    const rel = parts.join("/");

    // seguridad: evitar "../"
    if (!rel || rel.includes("..")) {
      res.status(400).json({ error: "Bad path" });
      return;
    }

    const filePath = path.join(process.cwd(), "public", "uploads", rel);

    if (!fs.existsSync(filePath)) {
      res.status(404).end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
