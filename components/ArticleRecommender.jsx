import { useState } from "react";
import Link from "next/link";
import styles from "./ArticleRecommender.module.css";

const EXAMPLES = [
  "Busco fichas para practicar sumas en primaria.",
  "Necesito una actividad imprimible sobre la letra R.",
  "Quiero reforzar la comprensión lectora de mi hijo.",
];

function track(eventName, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") window.gtag("event", eventName, params);
}

export default function ArticleRecommender() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [context, setContext] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event?.preventDefault();
    const query = message.trim();
    if (query.length < 3 || loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, context }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo realizar la consulta.");
      setResult(data);
      setContext((previous) => [...previous, query].slice(-5));
      setMessage("");
      track("article_recommender_query", {
        result_count: data.recommendations?.length || 0,
        has_follow_up: !!data.needsFollowUp,
        detected_filters: (data.detectedFilters || []).join(",") || "none",
      });
    } catch (requestError) {
      setError(requestError.message || "No se pudo realizar la consulta.");
    } finally {
      setLoading(false);
    }
  }

  function chooseExample(example) {
    setMessage(example);
    setOpen(true);
  }

  return (
    <aside className={styles.root} aria-label="Asistente para encontrar fichas educativas">
      {open && <button type="button" className={styles.backdrop} aria-label="Cerrar asistente" onClick={() => setOpen(false)} />}
      <section className={`${styles.panel} ${open ? styles.panelOpen : ""}`} role="dialog" aria-modal={open} aria-labelledby="recommender-title">
        <div className={styles.stickyIntro}>
          <div className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Encuentra tu ficha</p>
              <h2 id="recommender-title">¿Qué necesitas trabajar?</h2>
            </div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Cerrar asistente">×</button>
          </div>
          <p className={styles.welcome}>Dime la edad, la materia o la habilidad que quieres reforzar.</p>
        </div>

        {!result && <div className={styles.examples} aria-label="Ejemplos de consulta">{EXAMPLES.map((example) => <button type="button" key={example} onClick={() => chooseExample(example)}>{example}</button>)}</div>}

        {result && (
          <div className={styles.results} aria-live="polite">
            <p className={styles.intro}>{result.intro}</p>
            {result.needsFollowUp && <p className={styles.followUp}>{result.followUpQuestion}</p>}
            <div className={styles.cards}>
              {(result.recommendations || []).map((item) => (
                <article className={styles.card} key={item.id}>
                  {item.image && <img src={item.image} alt="" className={styles.image} loading="lazy" />}
                  <div className={styles.cardBody}>
                    <h3>{item.title}</h3>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    {(item.age || item.stage || item.subjects?.length) && <p className={styles.metadata}>{[item.age, item.stage, ...(item.subjects || []).slice(0, 2)].filter(Boolean).join(" · ")}</p>}
                    <p className={styles.reason}><strong>Por qué encaja:</strong> {item.reason}</p>
                    <div className={styles.actions}>
                      <Link href={item.url} className={styles.viewButton} onClick={() => track("article_recommender_click", { resource_id: item.id })}>Ver ficha</Link>
                      {item.downloadUrl && <a href={item.downloadUrl} className={styles.downloadButton}>Descargar</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {error && <p className={styles.error} role="alert">{error}</p>}
        <form className={styles.form} onSubmit={submit}>
          <label htmlFor="article-recommender-message">Describe la actividad que buscas</label>
          <textarea id="article-recommender-message" value={message} onChange={(event) => setMessage(event.target.value.slice(0, 700))} maxLength={700} rows={3} placeholder="Ej.: Ficha corta para practicar la letra R con un niño de 5 años" disabled={loading} />
          <button type="submit" disabled={loading || message.trim().length < 3}>{loading ? "Buscando fichas reales…" : "Buscar fichas"}</button>
        </form>
        <p className={styles.notice}>Las recomendaciones son orientativas. Revisa cada ficha antes de usarla con el niño o el grupo.</p>
      </section>
      {!open && (
        <button type="button" className={styles.launcher} onClick={() => setOpen(true)} aria-label="Abrir asistente para encontrar fichas">
          <svg className={styles.robotIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3v3m-5 4.5V18a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7.5A2.5 2.5 0 0 0 14.5 8h-5A2.5 2.5 0 0 0 7 10.5Z" />
            <path d="M9.5 13h.01M14.5 13h.01M10 16h4M12 3a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM5 12H3m18 0h-2" />
          </svg>
          <span>Encontrar una ficha</span>
        </button>
      )}
    </aside>
  );
}
