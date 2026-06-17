import Link from "next/link";
import styles from "./StaticTopicPage.module.css";

export default function StaticTopicPage({ topic }) {
  if (!topic) return null;

  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>Fichas para imprimir</p>
      <h1>{topic.name}</h1>
      {topic.description && <p className={styles.description}>{topic.description}</p>}

      <div className={styles.grid}>
        {(topic.articles || []).map((article) => (
          <Link key={article.id || article.slug} href={`/${article.slug}`} className={styles.card}>
            <div className={styles.titleBox}>
              <h2>{article.title}</h2>
            </div>
            {article.excerpt && <p>{article.excerpt}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
