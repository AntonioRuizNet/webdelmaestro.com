import Link from "next/link";
import styles from "./StaticTopicsHome.module.css";

export default function StaticTopicsHome({ topics = [] }) {
  if (!topics.length) return null;

  return (
    <section className={styles.section} aria-labelledby="fichas-para-imprimir-title">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Recursos educativos</p>
          <h1 id="fichas-para-imprimir-title" className={styles.title}>
            Fichas para imprimir
          </h1>
        </div>
      </div>

      <div className={styles.topicGrid}>
        {topics.map((topic) => (
          <article key={topic.slug} className={styles.topicCard}>
            <div className={styles.topicCardHeader}>
              <h2 className={styles.topicTitle}>{topic.name}</h2>
              <Link href={`/${topic.slug}`} className={styles.moreLink}>
                Ver más
              </Link>
            </div>

            <div className={styles.articleGrid}>
              {(topic.articles || []).map((article) => (
                <Link key={article.id || article.slug} href={`/${article.slug}`} className={styles.articleCard}>
                  <div className={styles.articleTitleBox}>
                    <h3>{article.title}</h3>
                  </div>
                  {/*article.excerpt && <p className={styles.articleExcerpt}>{article.excerpt}</p>*/}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
