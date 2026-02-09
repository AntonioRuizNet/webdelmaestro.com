import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import { withAuthGSSP } from "@/lib/withAuthGSSP";
import styles from "./PostsAdmin.module.css";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      setPosts(data.posts || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []); // eslint-disable-line

  const onDelete = async (id) => {
    if (!confirm("¿Borrar este artículo?")) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (!res.ok) alert("No se pudo borrar.");
    fetchPosts();
  };

  const onTogglePublish = async (post) => {
    const next = !post.is_published;
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: next }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "No se pudo actualizar.");
    }

    fetchPosts();
  };

  return (
    <ProtectedLayout>
      {/* Header */}
      <div className={styles.pageTitleRow}>
        <h1 className={styles.h1}>Artículos</h1>
        <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/admin/posts/new">
          + Nuevo
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.card} style={{ marginTop: "1rem" }}>
        <div className={styles.filters}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, slug o excerpt…"
            className={styles.input}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)} className={styles.select}>
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>

          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchPosts} disabled={loading} type="button">
            {loading ? "Cargando…" : "Filtrar"}
          </button>
        </div>
      </div>

      {/* List */}
      {posts.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No hay artículos.</p>
      ) : (
        <div className={styles.list}>
          {posts.map((p) => (
            <div key={p.id} className={`${styles.card} ${styles.postRow}`}>
              <div className={styles.postMain}>
                <div className={styles.postTitleRow}>
                  <strong className={styles.postTitle}>{p.title}</strong>
                  <span className={styles.badge}>{p.is_published ? "Publicado" : "Borrador"}</span>
                </div>

                <div className={styles.slugLine}>
                  <code>/{p.slug}</code>
                </div>

                {p.excerpt ? <div className={styles.excerpt}>{p.excerpt}</div> : null}
              </div>

              <div className={styles.actions}>
                <Link className={styles.btn} href={`/admin/posts/${p.id}`}>
                  Editar
                </Link>

                <button className={styles.btn} type="button" onClick={() => onTogglePublish(p)}>
                  {p.is_published ? "Despublicar" : "Publicar"}
                </button>

                <button className={`${styles.btn} ${styles.btnDanger}`} type="button" onClick={() => onDelete(p.id)}>
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedLayout>
  );
}

export const getServerSideProps = withAuthGSSP();
