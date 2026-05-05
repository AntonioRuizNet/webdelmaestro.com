import styles from './PdfViewer.module.css';

export default function PdfViewer({ pdfUrl, title = 'Vista previa PDF', fileName = 'ficha.pdf' }) {
  if (!pdfUrl) {
    return (
      <div className={styles.empty}>
        Genera una ficha para ver el PDF.
      </div>
    );
  }

  return (
    <section className={styles.wrapper} aria-label={title}>
      <div className={styles.header}>
        <h3>{title}</h3>
        <a className={styles.download} href={pdfUrl} download={fileName}>
          Descargar PDF
        </a>
      </div>
      <iframe className={styles.viewer} src={pdfUrl} title={title} />
    </section>
  );
}
