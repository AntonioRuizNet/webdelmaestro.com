import { useEffect, useMemo, useState } from "react";
import PdfViewer from "@/components/Generadores/PdfViewer/PdfViewer";
import { createWorksheetPdf, createPdfBlobUrl } from "@/lib/pdf/worksheetPdf";
import styles from "./MathWorksheetGenerator.module.css";

const OPERATION_LABELS = {
  sumas: "sumas",
  restas: "restas",
  multiplicaciones: "multiplicaciones",
};

const LEVEL_CONFIG = {
  1: {
    label: "Números hasta 10",
    min: 1,
    max: 10,
    multiplicationMax: 5,
  },
  2: {
    label: "Números hasta 99",
    min: 10,
    max: 99,
    multiplicationMax: 10,
  },
  3: {
    label: "Números hasta 999",
    min: 100,
    max: 999,
    multiplicationMax: 12,
  },
};

const MULTIPLICATION_DIGITS_CONFIG = {
  1: { label: "1 cifra", min: 2, max: 9 },
  2: { label: "2 cifras", min: 10, max: 99 },
  3: { label: "3 cifras", min: 100, max: 999 },
};

const MAX_ATTEMPTS = 200;

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hasAdditionCarrying(a, b) {
  let first = a;
  let second = b;

  while (first > 0 || second > 0) {
    const firstDigit = first % 10;
    const secondDigit = second % 10;

    if (firstDigit + secondDigit >= 10) {
      return true;
    }

    first = Math.floor(first / 10);
    second = Math.floor(second / 10);
  }

  return false;
}

function hasSubtractionBorrowing(a, b) {
  let first = a;
  let second = b;

  while (first > 0 || second > 0) {
    const firstDigit = first % 10;
    const secondDigit = second % 10;

    if (firstDigit < secondDigit) {
      return true;
    }

    first = Math.floor(first / 10);
    second = Math.floor(second / 10);
  }

  return false;
}

function operationMatchesDifficulty(operation, operationType, difficulty) {
  if (operationType === "multiplicaciones" || difficulty === "mixta") {
    return true;
  }

  if (operationType === "sumas") {
    const hasCarrying = hasAdditionCarrying(operation.a, operation.b);

    if (difficulty === "sin-llevadas") return !hasCarrying;
    if (difficulty === "con-llevadas") return hasCarrying;
  }

  if (operationType === "restas") {
    const hasBorrowing = hasSubtractionBorrowing(operation.a, operation.b);

    if (difficulty === "sin-llevadas") return !hasBorrowing;
    if (difficulty === "con-llevadas") return hasBorrowing;
  }

  return true;
}

function createAddition(level) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

  if (level === 1) {
    const a = getRandomNumber(1, 9);
    const b = getRandomNumber(1, 10 - a);

    return { a, b };
  }

  return {
    a: getRandomNumber(config.min, config.max),
    b: getRandomNumber(config.min, config.max),
  };
}

function createSubtraction(level) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1];

  if (level === 1) {
    const a = getRandomNumber(2, 10);
    const b = getRandomNumber(1, a);

    return { a, b };
  }

  const first = getRandomNumber(config.min, config.max);
  const second = getRandomNumber(config.min, config.max);

  return first >= second ? { a: first, b: second } : { a: second, b: first };
}

function createMultiplication(firstDigits, secondDigits) {
  const firstConfig = MULTIPLICATION_DIGITS_CONFIG[firstDigits] || MULTIPLICATION_DIGITS_CONFIG[1];
  const secondConfig = MULTIPLICATION_DIGITS_CONFIG[secondDigits] || MULTIPLICATION_DIGITS_CONFIG[1];

  return {
    a: getRandomNumber(firstConfig.min, firstConfig.max),
    b: getRandomNumber(secondConfig.min, secondConfig.max),
  };
}

function createRawOperation(operationType, level, multiplicationDigits) {
  if (operationType === "restas") {
    return createSubtraction(level);
  }

  if (operationType === "multiplicaciones") {
    return createMultiplication(multiplicationDigits.first, multiplicationDigits.second);
  }

  return createAddition(level);
}

function createOperation(operationType, level, difficulty, multiplicationDigits) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const operation = createRawOperation(operationType, level, multiplicationDigits);

    if (operationMatchesDifficulty(operation, operationType, difficulty)) {
      return operation;
    }
  }

  return createRawOperation(operationType, level, multiplicationDigits);
}

function validateOperations(operations, operationType, difficulty) {
  return operations.filter((operation) => operationMatchesDifficulty(operation, operationType, difficulty));
}

function createOperations(operationType, level, difficulty, amount, multiplicationDigits) {
  const operations = [];

  while (operations.length < amount) {
    const operation = createOperation(operationType, level, difficulty, multiplicationDigits);

    if (operationMatchesDifficulty(operation, operationType, difficulty)) {
      operations.push(operation);
    }
  }

  return operations;
}

function getOperationSymbol(operationType) {
  if (operationType === "restas") return "-";
  if (operationType === "multiplicaciones") return "x";
  return "+";
}

function getInstruction(operationType, difficulty) {
  if (operationType === "multiplicaciones") {
    return "Resuelve las multiplicaciones. Repasa las tablas antes de empezar.";
  }

  if (difficulty === "sin-llevadas") {
    return "Resuelve las operaciones sin llevadas. Coloca bien unidades, decenas y centenas.";
  }

  if (difficulty === "con-llevadas") {
    return "Resuelve las operaciones con llevadas. Revisa cada columna antes de continuar.";
  }

  return "Resuelve las operaciones. Algunas pueden tener llevadas.";
}

function formatOperation(operation, operationType) {
  const symbol = getOperationSymbol(operationType);
  const maxLength = Math.max(String(operation.a).length, String(operation.b).length);

  return {
    top: String(operation.a).padStart(maxLength, " "),
    bottom: `${symbol} ${String(operation.b).padStart(maxLength, " ")}`,
    line: "_".repeat(maxLength + 2),
  };
}

function renderMathOperations(lines, helpers, operations, operationType, difficulty) {
  const { textLine, contentStartY } = helpers;

  const validOperations = validateOperations(operations, operationType, difficulty);

  const columns = 4;
  const startX = 62;
  const columnGap = 128;
  const rowGap = validOperations.length <= 12 ? 135 : validOperations.length <= 16 ? 124 : 120;

  validOperations.forEach((operation, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    const x = startX + column * columnGap;
    const y = contentStartY - row * rowGap;

    const formatted = formatOperation(operation, operationType);

    lines.push(
      textLine({
        x: x + 48,
        y,
        text: formatted.top,
        size: 18,
        font: "F2",
      }),
    );

    lines.push(
      textLine({
        x: x + 28,
        y: y - 20,
        text: formatted.bottom,
        size: 18,
        font: "F2",
      }),
    );

    lines.push(
      textLine({
        x: x + 28,
        y: y - 24,
        text: formatted.line,
        size: 18,
        font: "F2",
      }),
    );
  });
}

export default function MathWorksheetGenerator({ operationType }) {
  const [level, setLevel] = useState(1);
  const [difficulty, setDifficulty] = useState("mixta");
  const [amount, setAmount] = useState(20);
  const [seed, setSeed] = useState(1);
  const [pdfUrl, setPdfUrl] = useState("");
  const [firstFactorDigits, setFirstFactorDigits] = useState(1);
  const [secondFactorDigits, setSecondFactorDigits] = useState(1);

  const title = `Ficha de ${OPERATION_LABELS[operationType] || "matemáticas"}`;

  const operations = useMemo(
    () =>
      createOperations(operationType, Number(level), difficulty, Number(amount), {
        first: Number(firstFactorDigits),
        second: Number(secondFactorDigits),
      }),
    [operationType, level, difficulty, amount, firstFactorDigits, secondFactorDigits, seed],
  );

  useEffect(() => {
    let nextUrl = "";
    let isCancelled = false;

    async function generatePdf() {
      const pdfBlob = await createWorksheetPdf({
        title,
        instruction: getInstruction(operationType, difficulty),
        renderContent: (lines, helpers) => {
          renderMathOperations(lines, helpers, operations, operationType, difficulty);
        },
      });

      if (isCancelled) return;

      nextUrl = createPdfBlobUrl(pdfBlob);
      setPdfUrl(nextUrl);
    }

    generatePdf();

    return () => {
      isCancelled = true;
      if (nextUrl) URL.revokeObjectURL(nextUrl);
    };
  }, [title, operationType, difficulty, operations]);

  return (
    <div className={styles.grid}>
      <section className={styles.panel} aria-label="Configuración de la ficha">
        <h3>Configura la ficha</h3>

        <label className={styles.field}>
          <span>Nivel</span>
          <select value={level} onChange={(event) => setLevel(Number(event.target.value))}>
            {Object.entries(LEVEL_CONFIG).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </label>

        {operationType !== "multiplicaciones" && (
          <label className={styles.field}>
            <span>Dificultad</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              <option value="sin-llevadas">Sin llevadas</option>
              <option value="mixta">Mixta</option>
              <option value="con-llevadas">Con llevadas</option>
            </select>
          </label>
        )}

        {operationType === "multiplicaciones" && (
          <>
            <label className={styles.field}>
              <span>Primer número</span>
              <select value={firstFactorDigits} onChange={(event) => setFirstFactorDigits(Number(event.target.value))}>
                {Object.entries(MULTIPLICATION_DIGITS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Segundo número</span>
              <select value={secondFactorDigits} onChange={(event) => setSecondFactorDigits(Number(event.target.value))}>
                {Object.entries(MULTIPLICATION_DIGITS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className={styles.field}>
          <span>Número de operaciones</span>
          <select value={amount} onChange={(event) => setAmount(Number(event.target.value))}>
            <option value="12">12 operaciones</option>
            <option value="16">16 operaciones</option>
            <option value="20">20 operaciones</option>
            <option value="40">40 operaciones</option>
          </select>
        </label>

        <button className={styles.button} type="button" onClick={() => setSeed((current) => current + 1)}>
          Generar nueva ficha
        </button>

        <p className={styles.note}>La impresión se realiza desde los controles del visor PDF del navegador.</p>
      </section>

      <PdfViewer pdfUrl={pdfUrl} title="Vista previa de la ficha" />
    </div>
  );
}
