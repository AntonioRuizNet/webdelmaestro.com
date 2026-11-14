import { useEffect, useState } from "react";
import styles from "./SupportNotice.module.css";

const STORAGE_KEY = "support-notice-hidden-until";
const DAY = 24 * 60 * 60 * 1000;
let hiddenUntil = 0;
let shownThisSession = false;

function track(name) {
  if (typeof window.gtag === "function") window.gtag("event", name);
}

function suppress(days) {
  hiddenUntil = Date.now() + days * DAY;
  try { localStorage.setItem(STORAGE_KEY, String(hiddenUntil)); } catch (_) { /* Storage may be unavailable. */ }
}

export default function SupportNotice() {
  const [visible, setVisible] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try { hiddenUntil = Math.max(hiddenUntil, Number(localStorage.getItem(STORAGE_KEY)) || 0); } catch (_) {}
    if (hiddenUntil > Date.now() || shownThisSession) return;
    const timer = setTimeout(() => {
      if (hiddenUntil > Date.now()) return;
      shownThisSession = true;
      setVisible(true);
      track("support_notice_view");
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    if (hiddenUntil <= Date.now()) suppress(30);
    track("support_notice_close");
    setVisible(false);
  }

  async function share() {
    track("support_share_click");
    suppress(90);
    const url = "https://webdelmaestro.com/";
    if (navigator.share) {
      try { await navigator.share({ title: "Web del Maestro", url }); setVisible(false); return; }
      catch (error) { if (error.name === "AbortError") { setVisible(false); return; } }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Enlace copiado. ¡Gracias por compartir!");
    } catch (_) {
      setStatus("Copia este enlace: https://webdelmaestro.com/");
    }
  }

  function startFeedback() {
    track("support_feedback_click");
    suppress(90);
    setFeedback(true);
    setStatus("");
  }

  async function submitFeedback(event) {
    event.preventDefault();
    if (sending || message.trim().length < 3) return;
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (!response.ok) throw new Error();
      setMessage("");
      setStatus("¡Gracias por compartir tu opinión!");
      setFeedback(false);
    } catch (_) {
      setStatus("No se ha podido enviar tu opinión. Inténtalo de nuevo.");
    } finally { setSending(false); }
  }

  if (!visible) return null;
  return (
    <aside className={styles.notice} aria-labelledby="support-title">
      <button type="button" className={styles.close} onClick={close} aria-label="Cerrar aviso">×</button>
      <h2 id="support-title">❤️ ¿Te gusta Web del Maestro?</h2>
      {feedback ? (
        <form className={styles.form} onSubmit={submitFeedback}>
          <label htmlFor="support-feedback">Cuéntame tu opinión sobre Web del Maestro</label>
          <textarea id="support-feedback" value={message} onChange={(event) => setMessage(event.target.value)} minLength={3} maxLength={2000} rows={4} required autoFocus />
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar opinión"}</button>
            <button className={styles.secondary} type="button" onClick={() => setVisible(false)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <>
          <p>Soy Antonio Ruiz, el desarrollador de esta web. Si mis recursos te resultan útiles, puedes apoyarme compartiendo la página o enviándome tu opinión. ¡Tu apoyo me anima a seguir mejorando!</p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={share}>Compartir esta web</button>
            <button className={styles.secondary} type="button" onClick={startFeedback}>Enviar mi opinión</button>
            <a href="https://antonioruiz.net/" target="_blank" rel="noopener noreferrer" onClick={() => { track("support_portfolio_click"); suppress(90); setVisible(false); }}>Conocer al desarrollador</a>
          </div>
          <div className={styles.review}>
            <a href="https://g.page/r/CTLpjEwqu-1dEBM/review" target="_blank" rel="noopener noreferrer" onClick={() => { track("professional_review_click"); suppress(90); setVisible(false); }}>¿Has utilizado mis servicios de desarrollo web? Valóralos en Google.</a>
          </div>
        </>
      )}
      {status && <p className={styles.status} role="status">{status}</p>}
    </aside>
  );
}

