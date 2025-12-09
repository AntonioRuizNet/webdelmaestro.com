"use client";

import { useEffect, useState } from "react";
import Card from "./Card";
import styles from "./cardList.module.css";

export default function CardList({
  term = "",
  column = "title",
  limit = 12,
  random = false,
  exclude = [],
  gridColumns = 4, // ← número de columnas
}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (term) params.set("term", term);
        params.set("column", column);
        params.set("limit", String(limit));
        if (random) params.set("random", "1");

        exclude.forEach((prefix) => {
          params.append("exclude", prefix);
        });

        const res = await fetch(`/api/getPosts?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Error API: ${res.status}`);
        }

        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar posts");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [term, column, limit, random, exclude]);

  if (loading) return <p>Cargando posts...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!posts.length) return <p>No hay posts para mostrar.</p>;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.grid} ${styles[`cols-${gridColumns}`] || ""}`}>
        {posts.map((post) => (
          <Card key={post.id} slug={post.slug} title={post.title} excerpt={post.excerpt || post.body} featured_image={post.featured_image} />
        ))}
      </div>
    </div>
  );
}
