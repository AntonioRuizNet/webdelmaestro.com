import { useState } from "react";
import Link from "next/link";
import { createPdfBlobUrl } from "@/lib/pdf/worksheetPdf";
import { createStaticWorksheetPdf } from "@/lib/pdf/staticWorksheetPdf";
import styles from "./StaticArticleRenderer.module.css";

function Section({ section }) {
  if (!section) return null;

  if (section.type === "heading") {
    const Tag = section.level === 3 ? "h3" : "h2";
    return <Tag>{section.text}</Tag>;
  }

  if (section.type === "list") {
    return (
      <ul>
        {(section.items || []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (section.type === "link") {
    return <Link href={section.href}>{section.text}</Link>;
  }

  return <p>{section.text}</p>;
}

function getActivityPreview(activity) {
  if (!activity) return null;

  if (activity.type === "wordBankParagraph") {
    return activity.title || `Banco de palabras: ${(activity.words || []).slice(0, 4).join(", ")}`;
  }

  if (activity.type === "oddOneOutGroups") {
    const firstGroup = activity.groups?.[0];
    const words = Array.isArray(firstGroup) ? firstGroup : firstGroup?.words;
    return activity.title || `Sobra: ${(words || []).slice(0, 4).join(" · ")}`;
  }

  if (activity.type === "chooseWord" || activity.type === "chooseAnswer") {
    const firstItem = activity.items?.[0] || activity.questions?.[0];
    return activity.title || firstItem?.sentence || firstItem?.question || firstItem?.text;
  }

  if (activity.type === "matchingColumns") {
    return activity.title || "Une cada palabra con su pareja";
  }

  if (activity.type === "readingComprehension") {
    return activity.title || "Lee el texto y responde";
  }

  if (activity.type === "fillBlanks") {
    return activity.title || activity.lines?.[0] || activity.sentences?.[0];
  }

  if (activity.type === "drawingBox") {
    return activity.title || activity.label || activity.instruction || "Dibuja en el recuadro";
  }

  if (activity.type === "textLines") {
    return activity.title || activity.lines?.[0] || activity.items?.[0];
  }

  return activity.title || activity.text || activity.label;
}

function getWorksheetPreviewItems(worksheet) {
  if (Array.isArray(worksheet.previewItems) && worksheet.previewItems.length) {
    return worksheet.previewItems;
  }

  if (Array.isArray(worksheet.activities) && worksheet.activities.length) {
    return worksheet.activities.map(getActivityPreview).filter(Boolean);
  }

  return [worksheet.description || "Ficha sin actividades configuradas"];
}

function WorksheetPreview({ worksheet }) {
  const previewItems = getWorksheetPreviewItems(worksheet).filter(Boolean).slice(0, 5);

  return (
    <div className={styles.worksheetPreview} aria-label={`Vista previa de ${worksheet.title}`}>
      <div className={styles.previewToolbar}>
        <span />
        <span />
        <span />
      </div>

      <div className={styles.previewPage}>
        <p className={styles.previewLabel}>Vista previa</p>
        <h4>{worksheet.title}</h4>
        {worksheet.description && <p className={styles.previewDescription}>{worksheet.description}</p>}

        <div className={styles.previewLines}>
          {previewItems.map((item, index) => (
            <div key={`${worksheet.id}-preview-${index}`} className={styles.previewLine}>
              <span className={styles.previewNumber}>{index + 1}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StaticArticleRenderer({ post }) {
  const [loadingId, setLoadingId] = useState(null);
  const article = post?.staticArticle;

  async function handleDownload(worksheet) {
    try {
      setLoadingId(worksheet.id);
      const blob = await createStaticWorksheetPdf(worksheet);
      const url = createPdfBlobUrl(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${worksheet.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setLoadingId(null);
    }
  }

  if (!article) return null;

  return (
    <div className={styles.article}>
      <section className={styles.header}>
        <p className={styles.topic}>{article.topic?.name}</p>
        <h1>{post.title}</h1>
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
      </section>

      <div className={styles.content}>
        {(article.sections || []).map((section, index) => (
          <Section key={`${section.type}-${index}`} section={section} />
        ))}
      </div>

      {!!article.worksheets?.length && (
        <section className={styles.worksheets}>
          <h2>Fichas PDF para descargar</h2>
          <div className={styles.worksheetGrid}>
            {article.worksheets.map((worksheet) => (
              <article key={worksheet.id} className={styles.worksheetCard}>
                <WorksheetPreview worksheet={worksheet} />
                <h3>{worksheet.title}</h3>
                <p>{worksheet.description}</p>
                <button type="button" onClick={() => handleDownload(worksheet)} disabled={loadingId === worksheet.id}>
                  {loadingId === worksheet.id ? "Generando PDF..." : "Descargar ficha PDF"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
