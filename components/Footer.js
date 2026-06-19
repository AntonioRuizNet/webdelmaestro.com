"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    let active = true;

    fetch("/api/static-topics")
      .then((response) => {
        if (!response.ok) throw new Error("No se pudieron cargar los topics");
        return response.json();
      })
      .then((data) => {
        if (active) setTopics(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setTopics([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <section className={styles.topicsSection} aria-labelledby="footer-static-topics-title">
          <h2 id="footer-static-topics-title" className={styles.title}>
            Fichas para imprimir
          </h2>

          <ul className={styles.topicList}>
            {topics.map((topic) => (
              <li key={topic.slug}>
                <Link href={`/${topic.slug}`} className={styles.topicLink}>
                  {topic.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} Web del Maestro. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
