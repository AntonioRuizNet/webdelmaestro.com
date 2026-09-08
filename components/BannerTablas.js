import styles from "./BannerTablas.module.css";

export default function BannerTablas() {
  return (
    <a
      href="https://tablasdemultiplicar.app/"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.banner}
      aria-label="Aprende y enseña las tablas de multiplicar con tablasdemultiplicar.app"
    >
      <div className={styles.content}>
        <div className={styles.icon}>✖️</div>

        <div className={styles.text}>
          <span className={styles.eyebrow}>Para maestros, familias y alumnos</span>

          <strong className={styles.title}>Aprende y enseña las tablas de multiplicar</strong>

          <span className={styles.description}>
            Practica gratis, consigue puntos y sube de nivel. Los maestros pueden crear aulas y pruebas, y seguir el progreso de
            sus alumnos.
          </span>
        </div>

        <span className={styles.button}>
          Empezar gratis
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  );
}
