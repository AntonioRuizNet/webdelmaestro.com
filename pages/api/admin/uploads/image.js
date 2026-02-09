import fs from "fs";
import path from "path";
import crypto from "crypto";
import formidable from "formidable";
import { requireEditorRole } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function moveFile(src, dest) {
  try {
    await fs.promises.rename(src, dest);
  } catch (e) {
    // fallback si rename falla (p.ej. cross-device)
    await fs.promises.copyFile(src, dest);
    await fs.promises.unlink(src).catch(() => {});
  }
}

export default async function handler(req, res) {
  const session = await requireEditorRole(req, res);
  if (!session) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    multiples: false,
    maxFileSize: MAX_SIZE,
  });

  form.parse(req, async (err, fields, files) => {
    let tmpPath = null;

    try {
      if (err) {
        return res.status(400).json({ error: "Upload error", details: err.message });
      }

      const file = files?.file;
      const f = Array.isArray(file) ? file[0] : file;
      if (!f) return res.status(400).json({ error: "Missing file" });

      const mime = f.mimetype || "";
      if (!ALLOWED.has(mime)) {
        return res.status(415).json({ error: "Unsupported file type" });
      }

      const ext =
        mime === "image/jpeg"
          ? ".jpg"
          : mime === "image/png"
            ? ".png"
            : mime === "image/webp"
              ? ".webp"
              : mime === "image/gif"
                ? ".gif"
                : "";

      const now = new Date();
      const subdir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;

      // Guardamos dentro de /public/uploads/yyyy/mm
      const uploadDir = path.join(process.cwd(), "public", "uploads", subdir);
      ensureDir(uploadDir);

      const name = crypto.randomBytes(16).toString("hex") + ext;
      const dest = path.join(uploadDir, name);

      tmpPath = f.filepath;
      await moveFile(tmpPath, dest);

      // ✅ IMPORTANTE: en tu producción /uploads/* devuelve 404, así que servimos por API.
      const url = `/api/uploads/${subdir}/${name}`;

      return res.status(200).json({ ok: true, url });
    } catch (e) {
      console.error("POST /api/admin/uploads/image error:", e);

      // Limpieza del temporal si algo falla
      if (tmpPath) {
        try {
          await fs.promises.unlink(tmpPath);
        } catch (_) {}
      }

      return res.status(500).json({ error: "Internal error" });
    }
  });
}
