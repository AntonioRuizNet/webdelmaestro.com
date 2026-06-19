"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Generadores from "@/components/Generadores/Generadores";
import styles from "./Nav.module.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <header className={styles.header}>
        <nav className={styles.mainNav} aria-label="Navegación principal">
          <div className={styles.navLeft}>
            <Link href="/" className={styles.navLogo}>
              Web del Maestro
            </Link>
          </div>

          <ul className={styles.navLinks}>
            <li>
              <Link href="https://tablasdemultiplicar.app/" target="_blank" rel="noopener noreferrer">
                Tablas de multiplicar <sup className={styles.appBadge}>App</sup>
              </Link>
            </li>
          </ul>

          <form action="/buscar" method="GET" role="search" aria-label="Buscar en Web del Maestro" className={styles.searchForm}>
            <input
              type="text"
              name="q"
              className={styles.searcher}
              placeholder="Busca lo que quieras"
              aria-label="Escribe aquí para buscar manualidades o noticias"
            />
            <button type="submit" className={styles.searchButton}>
              BUSCAR
            </button>
          </form>

          <button type="button" className={styles.menuButton} onClick={() => setIsOpen(true)} aria-label="Abrir menú">
            ☰
          </button>
        </nav>
      </header>

      {isOpen && <button type="button" className={styles.overlay} onClick={() => setIsOpen(false)} aria-label="Cerrar menú" />}

      <aside className={`${styles.sideMenu} ${isOpen ? styles.sideMenuOpen : ""}`}>
        <div className={styles.sideHeader}>
          <strong>Menú</strong>

          <button type="button" className={styles.closeButton} onClick={() => setIsOpen(false)} aria-label="Cerrar menú">
            ×
          </button>
        </div>

        <form
          action="/buscar"
          method="GET"
          role="search"
          aria-label="Buscar en Web del Maestro"
          className={styles.sideSearchForm}
        >
          <input type="text" name="q" placeholder="Buscar fichas..." className={styles.sideSearcher} />
          <button type="submit" className={styles.sideSearchButton}>
            Buscar
          </button>
        </form>

        <div className={styles.topicsBlock}>
          <h3>Fichas para imprimir</h3>

          <ul className={styles.topicList}>
            {topics.map((topic) => (
              <li key={topic.slug}>
                <Link href={`/${topic.slug}`} className={styles.moreLink} onClick={() => setIsOpen(false)}>
                  {topic.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <Generadores />
    </>
  );
}
