// components/CardList.jsx
// ❌ quitamos "use client"

import Card from "./Card";
import styles from "./cardList.module.css";

export default function CardList({ posts = [], gridColumns = 4 }) {
  if (!posts.length) return <p>No hay posts para mostrar.</p>;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.grid} ${styles[`cols-${gridColumns}`] || ""}`}>
        {posts.map((post) => (
          <Card
            key={post.id}
            slug={post.slug}
            title={post.title}
            // Ya no dependemos de body: solo excerpt
            excerpt={post.excerpt || ""}
            featured_image={post.featured_image}
          />
        ))}
      </div>
    </div>
  );
}
