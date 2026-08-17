import styles from "./BannerTablas.module.css";

export default function BannerTablas() {
  return (
    <a
      href="https://tablasdemultiplicar.app/"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.banner}
      aria-label="Practica las tablas de multiplicar en tablasdemultiplicar.app"
    >
      <div className={styles.content}>
        <div className={styles.icon}>✖️</div>

        <div className={styles.text}>
          <span className={styles.eyebrow}>Aprender jugando es más fácil</span>

          <strong className={styles.title}>¿Ya te sabes las tablas de multiplicar?</strong>

          <span className={styles.description}>Practica gratis, consigue puntos, sube de nivel y compite en el ranking.</span>
        </div>

        <span className={styles.button}>
          Practicar ahora
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  );
}
