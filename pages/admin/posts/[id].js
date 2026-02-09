import { useEffect, useState } from "react";
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

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [slugError, setSlugError] = useState("");

  const fetchPost = async () => {
    if (!id) return;

    setLoading(true);
    const res = await fetch(`/api/admin/posts/${id}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data?.error || "No se pudo cargar.");
      setLoading(false);
      return;
    }

    const p = data.post;
    setTitle(p.title || "");
    setSlug(p.slug || "");
    setExcerpt(p.excerpt || "");
    setMetaTitle(p.meta_title || "");
    setMetaDescription(p.meta_description || "");
    setFeaturedImage(p.featured_image || "");
    setBodyHtml(p.body || "");
    setIsPublished(!!p.is_published);
    setLoading(false);
  };

  useEffect(() => {
    fetchPost();
  }, [id]); // eslint-disable-line

  const checkSlug = async (s) => {
    if (!s || !id) return;

    const res = await fetch(`/api/admin/posts/check-slug?slug=${encodeURIComponent(s)}&excludeId=${encodeURIComponent(id)}`);
    const data = await res.json().catch(() => ({}));
    setSlugError(data?.exists ? "Este slug ya existe" : "");
  };

  const uploadImage = async (file) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/admin/uploads/image", {
      method: "POST",
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed");
    return data.url;
  };

  const onSave = async (extra = {}) => {
    if (slugError) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
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
          ...extra,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "No se pudo guardar.");
      } else {
        if (extra?.isPublished === true) setIsPublished(true);
        if (extra?.isPublished === false) setIsPublished(false);
        await fetchPost();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <p>Cargando…</p>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      {/* Header */}
      <div className={styles.pageTitleRow}>
        <h1 className={styles.h1}>Editar artículo</h1>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            type="button"
            onClick={() => onSave()}
            disabled={saving || !!slugError}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>

          <button
            className={styles.btn}
            type="button"
            onClick={() => onSave({ isPublished: !isPublished })}
            disabled={saving || !!slugError}
          >
            {isPublished ? "Despublicar" : "Publicar"}
          </button>

          <button className={styles.btn} type="button" onClick={() => router.push(`/${slug}`)} disabled={!slug || !isPublished}>
            Ver
          </button>

          <button className={styles.btn} type="button" onClick={() => router.push("/admin/posts")}>
            Volver
          </button>
        </div>
      </div>

      {/* Form */}
      <div className={`${styles.card} ${styles.cardGrid}`} style={{ marginTop: "1rem" }}>
        <label className={styles.field}>
          <div className={styles.label}>Título</div>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!metaTitle) setMetaTitle(e.target.value);
            }}
            required
            className={styles.input}
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
          />
          {slugError ? <div className={styles.error}>{slugError}</div> : null}
        </label>

        <label className={styles.field}>
          <div className={styles.label}>Excerpt</div>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className={styles.textarea} />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>Imagen destacada (URL, opcional)</div>
          <input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className={styles.input} />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>SEO Title (opcional)</div>
          <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={styles.input} />
        </label>

        <label className={styles.field}>
          <div className={styles.label}>SEO Description (opcional)</div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className={styles.textarea}
          />
        </label>

        <label className={styles.checkboxRow}>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publicado
        </label>

        <div className={styles.field}>
          <div className={styles.label}>Contenido</div>
          <div className={styles.editorWrap}>
            <RichTextEditor value={bodyHtml} onChange={setBodyHtml} onUploadImage={uploadImage} />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

export const getServerSideProps = withAuthGSSP();
