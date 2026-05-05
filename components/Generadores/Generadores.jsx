import Link from "next/link";
import { useRouter } from "next/router";
import { GENERADORES } from "@/data/generadores";
import styles from "./Generadores.module.css";

export default function Generadores() {
  const router = useRouter();
  const currentSlug = router.query?.slug;

  return (
    <section className={styles.wrapper} aria-label="Generadores educativos">
      <div className={styles.innerTitle}>
        <h4>
          <span className={styles.badge}>Nuevo</span> Generadores de fichas
        </h4>
      </div>
      <div className={styles.inner}>
        {GENERADORES.map((generator) => {
          const isActive = currentSlug === generator.slug;

          return (
            <Link
              key={generator.slug}
              href={`/generador/${generator.slug}`}
              className={`${styles.item} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={styles.icon} aria-hidden="true">
                {generator.icon}
              </span>
              <span>{generator.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
