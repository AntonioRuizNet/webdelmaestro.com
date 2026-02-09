import { useState } from "react";
import { useRouter } from "next/router";
import ProtectedLayout from "@/components/ProtectedLayout";
import { withAuthGSSP } from "@/lib/withAuthGSSP";
import RichTextEditor from "@/components/RichTextEditor";
import styles from "./PostsAdmin.module.css";

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\/]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}

export default function NewPost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  const checkSlug = async (s) => {
    if (!s) return;
    const res = await fetch(`/api/admin/posts/check-slug?slug=${encodeURIComponent(s)}`);
    const data = await res.json().catch(() => ({}));
    setSlugError(data?.exists ? "Este slug ya existe" : "");
  };

  const uploadImage = async (file) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/admin/uploads/image", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data.url; // en prod: /api/uploads/...
  };

  const onFeaturedFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFeatured(true);
    try {
      const url = await uploadImage(file);
      setFeaturedImage(url);
    } catch {
      alert("No se pudo subir la imagen destacada.");
    } finally {
      setUploadingFeatured(false);
      // permitir re-seleccionar el mismo archivo
      e.target.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (slugError) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          excerpt,
          bodyHtml,
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
          featuredImage: featuredImage || null,
          isPublished,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert(data?.error || "No se pudo guardar.");

      router.push(`/admin/posts/${data.post.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedLayout>
      <h1 className={styles.h1}>Nuevo artículo</h1>

      <form onSubmit={onSubmit} className={`${styles.card} ${styles.form}`}>
        <label className={styles.field}>
          <div className={styles.label}>Título</div>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
              if (!metaTitle) setMetaTitle(e.target.value);
            }}
            required
            className={styles.input}
            placeholder="Título del artículo"
          />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>Slug (ruta)</div>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            onBlur={() => checkSlug(slug)}
            required
            className={styles.input}
            placeholder="mi-articulo"
          />
          {slugError ? <div className={styles.error}>{slugError}</div> : null}
        </label>

        <label className={styles.field}>
          <div className={styles.label}>Excerpt</div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className={styles.textarea}
            placeholder="Resumen breve (opcional)"
          />
        </label>

        {/* Imagen destacada por subida */}
        <div className={styles.field}>
          <div className={styles.label}>Imagen destacada (opcional)</div>

          <div className={styles.row}>
            <input type="file" accept="image/*" onChange={onFeaturedFileChange} disabled={uploadingFeatured} />
            {featuredImage ? (
              <button type="button" className={styles.btn} onClick={() => setFeaturedImage("")} disabled={uploadingFeatured}>
                Quitar
              </button>
            ) : null}
          </div>

          {uploadingFeatured ? <div className={styles.help}>Subiendo imagen…</div> : null}

          {featuredImage ? (
            <div className={styles.help} style={{ overflowWrap: "anywhere" }}>
              URL: <code>{featuredImage}</code>
            </div>
          ) : (
            <div className={styles.help}>Sube un archivo y se guardará como URL automáticamente.</div>
          )}

          {featuredImage ? (
            <div style={{ marginTop: ".5rem" }}>
              {/* preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt="Imagen destacada" style={{ maxWidth: "100%", borderRadius: 12 }} />
            </div>
          ) : null}
        </div>

        <label className={styles.field}>
          <div className={styles.label}>SEO Title (opcional)</div>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className={styles.input}
            placeholder="Si lo dejas vacío, se usa el título"
          />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>SEO Description (opcional)</div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className={styles.textarea}
            placeholder="Si lo dejas vacío, se usa el excerpt"
          />
        </label>

        <label className={styles.checkboxRow}>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publicar al guardar
        </label>

        <div className={styles.field}>
          <div className={styles.label}>Contenido</div>
          <div className={styles.editorWrap}>
            <RichTextEditor value={bodyHtml} onChange={setBodyHtml} onUploadImage={uploadImage} />
          </div>
          <div className={styles.help}>Puedes insertar imágenes dentro del texto con el botón de imagen del editor.</div>
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="submit"
            disabled={saving || uploadingFeatured || !!slugError}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>

          <button className={styles.btn} type="button" onClick={() => router.push("/admin/posts")} disabled={uploadingFeatured}>
            Cancelar
          </button>
        </div>
      </form>
    </ProtectedLayout>
  );
}

export const getServerSideProps = withAuthGSSP();
