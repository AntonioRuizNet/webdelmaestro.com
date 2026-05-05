import { useEffect, useMemo, useState } from "react";
import PdfViewer from "@/components/Generadores/PdfViewer/PdfViewer";
import { createWorksheetPdf, createPdfBlobUrl } from "@/lib/pdf/worksheetPdf";
import styles from "./PrintableListGenerator.module.css";

const FONT_TRACE = "Escolar_P";
const FONT_TRACE_GUIDED = "ColeCarreira";

const TRACE_TYPES = {
  trazos: { label: "Trazos", font: FONT_TRACE },
  trazosPauta: { label: "Trazos en pauta", font: FONT_TRACE_GUIDED },
};

const WORK_TYPES = {
  letra: "Letra",
  palabra: "Palabra",
  frase: "Frase",
};

const DICTIONARY = {
  letters: [
    "a",
    "e",
    "i",
    "o",
    "u",
    "m",
    "p",
    "l",
    "s",
    "t",
    "n",
    "d",
    "b",
    "c",
    "r",
    "f",
    "g",
    "j",
    "v",
    "z",
    "ch",
    "ll",
    "ñ",
    "que",
    "qui",
    "gue",
    "gui",
  ],
  words: [
    "mamá",
    "papá",
    "luna",
    "mesa",
    "sol",
    "oso",
    "pala",
    "sapo",
    "casa",
    "ratón",
    "barco",
    "dedo",
    "nube",
    "taza",
    "flor",
    "vaca",
    "queso",
    "guitarra",
    "llave",
    "muñeca",
    "chocolate",
    "parque",
    "camino",
    "colegio",
    "pelota",
    "zapato",
    "jirafa",
    "gato",
    "perro",
    "árbol",
  ],
  phrases: [
    "Mamá me ama.",
    "El sol sale.",
    "La luna brilla.",
    "Mi mesa es roja.",
    "La casa es bonita.",
    "El ratón corre.",
    "Tengo una flor.",
    "La nube es blanca.",
    "El perro juega.",
    "La niña canta.",
    "El gato duerme.",
    "Mi amigo lee.",
    "La pelota rueda.",
    "El pájaro vuela alto.",
    "La maestra cuenta cuentos.",
    "Hoy vamos al colegio.",
    "El barco navega despacio.",
    "Mi mochila es azul.",
    "La jirafa come hojas.",
    "El niño dibuja una casa.",
  ],
};

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getDictionaryKey(workType) {
  if (workType === "letra") return "letters";
  if (workType === "palabra") return "words";
  return "phrases";
}

function getDefaultItems(workType, amount) {
  return shuffleItems(DICTIONARY[getDictionaryKey(workType)]).slice(0, amount);
}

function normalizeCustomText(text) {
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function pushText(lines, textLine, data, shouldThicken = false) {
  lines.push(textLine(data));

  if (shouldThicken) {
    lines.push(textLine({ ...data, x: data.x + 0.35 }));
  }
}

function createTracePdf({ traceType, workType, amount, customText, generatedItems }) {
  const customItems = normalizeCustomText(customText);
  const items = customItems.length ? customItems.slice(0, amount) : generatedItems.slice(0, amount);

  const title = `Ficha de caligrafía: ${TRACE_TYPES[traceType].label}`;
  const instruction = `Repasa cada ${WORK_TYPES[workType].toLowerCase()} siguiendo la dirección correcta del trazo.`;

  const renderContent = (lines, helpers) => {
    const { textLine, contentStartY } = helpers;

    const columns = workType === "frase" ? 1 : 4;
    const startX = 62;
    const columnGap = workType === "frase" ? 0 : 128;
    const rowGap = workType === "frase" ? 70 : 86;

    const font = TRACE_TYPES[traceType].font;
    const size = workType === "letra" ? 46 : workType === "palabra" ? 34 : 25;
    const shouldThicken = traceType === "trazosPauta";

    items.forEach((item, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * columnGap;
      const y = contentStartY - row * rowGap;

      pushText(lines, textLine, { x, y, text: item, size, font }, shouldThicken);
    });
  };

  return createWorksheetPdf({ title, instruction, renderContent });
}

export default function PrintableTraceGenerator() {
  const [traceType, setTraceType] = useState("trazos");
  const [workType, setWorkType] = useState("letra");
  const [amount, setAmount] = useState(8);
  const [customText, setCustomText] = useState("");
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [pdfUrl, setPdfUrl] = useState("");

  const generatedItems = useMemo(() => getDefaultItems(workType, amount), [workType, amount, refreshSeed]);

  const previewItems = useMemo(() => {
    const customItems = normalizeCustomText(customText);
    return customItems.length ? customItems.slice(0, amount) : generatedItems.slice(0, amount);
  }, [amount, customText, generatedItems]);

  useEffect(() => {
    let url;
    let isCancelled = false;

    async function generatePdf() {
      const pdfBlob = await createTracePdf({ traceType, workType, amount, customText, generatedItems });
      if (isCancelled) return;

      url = createPdfBlobUrl(pdfBlob);
      setPdfUrl(url);
    }

    generatePdf();

    return () => {
      isCancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [traceType, workType, amount, customText, generatedItems]);

  return (
    <section className={styles.generator}>
      <div className={styles.panel}>
        <div className={styles.intro}>
          <p className={styles.kicker}>Generador de fichas</p>
          <h2 className={styles.title}>Caligrafía: trazos</h2>
          <p className={styles.description}>Crea fichas para repasar letras, palabras y frases.</p>
        </div>

        <div className={styles.controls}>
          <label className={styles.field}>
            <span>Tipo de trazo</span>
            <select value={traceType} onChange={(event) => setTraceType(event.target.value)}>
              <option value="trazos">Trazos</option>
              <option value="trazosPauta">Trazos en pauta</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Contenido</span>
            <select value={workType} onChange={(event) => setWorkType(event.target.value)}>
              <option value="letra">Por letra</option>
              <option value="palabra">Por palabra</option>
              <option value="frase">Por frase</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Cantidad</span>
            <select value={amount} onChange={(event) => setAmount(Number(event.target.value))}>
              <option value={4}>4 elementos</option>
              <option value={8}>8 elementos</option>
              <option value={12}>12 elementos</option>
              <option value={16}>16 elementos</option>
              <option value={20}>20 elementos</option>
              <option value={24}>24 elementos</option>
              <option value={28}>28 elementos</option>
            </select>
          </label>
        </div>

        <button type="button" className={styles.generateButton} onClick={() => setRefreshSeed((value) => value + 1)}>
          Regenerar contenido
        </button>

        <label className={styles.textareaField}>
          <span>Texto personalizado</span>
          <textarea
            value={customText}
            onChange={(event) => setCustomText(event.target.value)}
            placeholder={
              workType === "frase"
                ? "Escribe una frase por línea. Recomendado: entre 3 y 7 palabras."
                : "Escribe una letra o palabra por línea..."
            }
          />
        </label>

        <div className={styles.previewBox}>
          <p className={styles.previewTitle}>Contenido de la ficha</p>
          <div className={styles.previewList}>
            {previewItems.map((item, index) => (
              <span key={`${item}-${index}`} className={styles.previewItem}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.viewer}>{pdfUrl && <PdfViewer pdfUrl={pdfUrl} title="Caligrafía: trazos" />}</div>
    </section>
  );
}
