import Link from "next/link";
import { getGeneratorBySlug, getVariantBySlug } from "@/data/generadores";
import styles from "./GeneratorLayout.module.css";

export default function GeneratorLayout({ slug, variantSlug, children }) {
  const generator = getGeneratorBySlug(slug);
  const activeVariant = getVariantBySlug(generator, variantSlug);

  if (!generator) {
    return (
      <main className={styles.container}>
        <h1>Generador no encontrado</h1>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          {generator.icon}
        </span>
        <div>
          <h1>{generator.title}</h1>
          <p>{generator.description}</p>
        </div>
      </div>

      <nav className={styles.variants} aria-label={`Variantes de ${generator.title}`}>
        {generator.variants.map((variant) => {
          const isActive = variant.slug === variantSlug;

          return (
            <Link
              key={variant.slug}
              href={`/generador/${generator.slug}/${variant.slug}`}
              className={`${styles.variant} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {variant.title}
            </Link>
          );
        })}
      </nav>

      <section className={styles.content}>
        {activeVariant && <h2 className={styles.variantTitle}>{activeVariant.title}</h2>}
        {children}
      </section>
    </main>
  );
}
