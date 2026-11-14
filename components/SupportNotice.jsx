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

  useEffect(() => {
    try { hiddenUntil = Math.max(hiddenUntil, Number(localStorage.getItem(STORAGE_KEY)) || 0); } catch (_) {}
    if (hiddenUntil > Date.now() || shownThisSession) return;
    shownThisSession = true;
    setVisible(true);
    track("support_notice_view");
  }, []);

  function close() {
    suppress(30);
    track("support_notice_close");
    setVisible(false);
  }

  function review() {
    track("professional_review_click");
    suppress(90);
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <aside className={styles.notice} aria-labelledby="support-title">
      <button type="button" className={styles.close} onClick={close} aria-label="Cerrar aviso">×</button>
      <h2 id="support-title">❤️ ¿Te gusta Web del Maestro?</h2>
      <p>Soy Antonio Ruiz, desarrollador de Web del Maestro. Tu apoyo me ayuda a seguir desarrollando y mejorando esta web. Puedes compartir tu opinión en Google. ¡Gracias por tu apoyo!</p>
      <a className={styles.primary} href="https://g.page/r/CTLpjEwqu-1dEBM/review" target="_blank" rel="noopener noreferrer" onClick={review}>Enviar mi opinión</a>
    </aside>
  );
}
