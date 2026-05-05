function sanitizePdfText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()\\]/g, (match) => `\\${match}`)
    .replace(/[^\x20-\x7E]/g, "");
}

function createPdfDocument(lines) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const objects = [];

  const stream = lines.join("\n");
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>");
  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function textLine({ x, y, text, size = 12, font = "F1" }) {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${sanitizePdfText(text)}) Tj ET`;
}

function getWorksheetTitle(operationType) {
  const titles = {
    sumas: "Ficha de sumas",
    restas: "Ficha de restas",
    multiplicaciones: "Ficha de multiplicaciones",
  };

  return titles[operationType] || "Ficha de matematicas";
}

function getOperationSymbol(operationType) {
  if (operationType === "restas") return "-";
  if (operationType === "multiplicaciones") return "x";
  return "+";
}

function formatOperation(operation, operationType) {
  const symbol = getOperationSymbol(operationType);
  const top = String(operation.a).padStart(3, " ");
  const bottom = `${symbol} ${String(operation.b).padStart(3, " ")}`;
  const line = "_____";

  return { top, bottom, line };
}

export function createMathWorksheetPdf({ title, operationType, operations }) {
  const lines = [];
  lines.push("q 1 1 1 rg 0 0 595.28 841.89 re f Q");
  lines.push(textLine({ x: 48, y: 795, text: title || getWorksheetTitle(operationType), size: 18, font: "F1" }));
  lines.push(
    textLine({
      x: 48,
      y: 768,
      text: "Nombre: ___________________________________________    Fecha: _____ / _____ / ________",
      size: 11,
      font: "F1",
    }),
  );
  lines.push(
    textLine({
      x: 48,
      y: 742,
      text: "Resuelve las operaciones.",
      size: 10,
      font: "F1",
    }),
  );

  const columns = 4;
  const rows = Math.ceil(operations.length / columns);
  const startX = 62;
  const startY = 692;
  const columnGap = 128;
  const rowGap = 125;

  operations.forEach((operation, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + column * columnGap;
    const y = startY - row * rowGap;
    const formatted = formatOperation(operation, operationType);

    lines.push(textLine({ x: x + 46, y, text: formatted.top, size: 16, font: "F2" }));
    lines.push(textLine({ x: x + 28, y: y - 20, text: formatted.bottom, size: 16, font: "F2" }));
    lines.push(textLine({ x: x + 28, y: y - 28, text: formatted.line, size: 16, font: "F2" }));
  });

  lines.push(textLine({ x: 48, y: 34, text: "webdelmaestro.com", size: 9, font: "F1" }));

  return createPdfDocument(lines);
}

export function createPdfBlobUrl(pdfContent) {
  const blob = new Blob([pdfContent], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}
