import Link from "next/link";
import styles from "./card.module.css";

export default function Card({ slug, title, excerpt, featured_image }) {
  const shortExcerpt = excerpt && excerpt.length > 140 ? excerpt.slice(0, 137) + "..." : excerpt || "";

  const href = `/${slug}`; // ej: "educacion/dictados-6o-primaria"

  return (
    <Link href={href} className={styles.card}>
      <article className={styles.inner}>
        {featured_image && (
          <div className={styles.imageWrapper}>
            <img src={featured_image} alt={title} className={styles.image} loading="lazy" />
          </div>
        )}
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          {shortExcerpt && <p className={styles.excerpt}>{shortExcerpt}</p>}
        </div>
      </article>
    </Link>
  );
}
