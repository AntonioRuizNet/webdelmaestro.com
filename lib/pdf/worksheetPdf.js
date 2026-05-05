import { jsPDF } from "jspdf";

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 48,
  footerY: 34,
};

const CONTENT = {
  startY: 650,
  endY: 72,
};

const FONT_FILES = {
  F1: { file: null, family: "helvetica", style: "normal" },
  F2: { file: null, family: "courier", style: "normal" },
  Escolar_P: { file: "/fonts/Escolar_P.TTF", family: "Escolar_P", style: "normal" },
  ColeCarreira: { file: "/fonts/ColeCarreira.TTF", family: "ColeCarreira", style: "normal" },
  Escolar_G: { file: "/fonts/Escolar_G.TTF", family: "Escolar_G", style: "normal" },
};

function textLine({ x, y, text, size = 12, font = "F1" }) {
  return {
    x,
    y,
    text: String(text || ""),
    size,
    font,
  };
}

function splitPdfText(text, maxLength = 70) {
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);

  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);

  return lines.length ? lines : [""];
}

async function fileToBase64(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`No se pudo cargar la fuente: ${path}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

async function registerFont(doc, fontKey, registeredFonts) {
  const config = FONT_FILES[fontKey];

  if (!config || !config.file || registeredFonts.has(fontKey)) {
    return;
  }

  const base64 = await fileToBase64(config.file);
  const filename = config.file.split("/").pop();

  doc.addFileToVFS(filename, base64);
  doc.addFont(filename, config.family, config.style);

  registeredFonts.add(fontKey);
}

async function registerNeededFonts(doc, pages) {
  const fonts = new Set();

  pages.forEach((pageLines) => {
    pageLines.forEach((line) => {
      if (line?.font) fonts.add(line.font);
    });
  });

  const registeredFonts = new Set();

  for (const font of fonts) {
    await registerFont(doc, font, registeredFonts);
  }
}

function getFontConfig(fontKey) {
  return FONT_FILES[fontKey] || FONT_FILES.F1;
}

function drawTextLines(doc, lines) {
  lines.forEach((line) => {
    const fontConfig = getFontConfig(line.font);

    doc.setFont(fontConfig.family, fontConfig.style);
    doc.setFontSize(line.size);
    doc.text(line.text, line.x, PAGE.height - line.y);
  });
}

function drawHeaderName(lines) {
  lines.push(
    textLine({
      x: PAGE.marginX,
      y: 795,
      text: "Nombre:  ___________________________________    Fecha:  _____________",
      size: 14,
      font: "F1",
    }),
  );
}

function drawRememberBlock(lines, { instruction }) {
  lines.push(
    textLine({
      x: PAGE.marginX + 16,
      y: 747,
      text: "RECUERDA",
      size: 13,
      font: "F1",
    }),
  );

  lines.push(
    textLine({
      x: PAGE.marginX + 16,
      y: 728,
      text: instruction,
      size: 12,
      font: "F1",
    }),
  );
}

function drawFooter(lines, { title, pageNumber = 1 }) {
  lines.push(
    textLine({
      x: PAGE.marginX,
      y: PAGE.footerY,
      text: "Material fotocopiable - webdelmaestro.com",
      size: 9,
      font: "F1",
    }),
  );

  lines.push(
    textLine({
      x: 420,
      y: PAGE.footerY,
      text: title,
      size: 9,
      font: "F1",
    }),
  );

  lines.push(
    textLine({
      x: 540,
      y: PAGE.footerY,
      text: `Pág. ${pageNumber}`,
      size: 9,
      font: "F1",
    }),
  );
}

function paginateContent(contentLines) {
  const FIRST_PAGE = {
    startY: 650,
    endY: CONTENT.endY,
  };

  const NEXT_PAGES = {
    startY: 750,
    endY: CONTENT.endY,
  };

  const firstPageHeight = FIRST_PAGE.startY - FIRST_PAGE.endY;
  const nextPageHeight = NEXT_PAGES.startY - NEXT_PAGES.endY;

  const pages = [[]];

  contentLines.forEach((line) => {
    const overflow = FIRST_PAGE.startY - line.y;

    let pageIndex = 0;
    let yInPage = line.y;

    if (overflow > firstPageHeight) {
      const nextOverflow = overflow - firstPageHeight;
      pageIndex = 1 + Math.floor(nextOverflow / nextPageHeight);
      yInPage = NEXT_PAGES.startY - (nextOverflow % nextPageHeight);
    }

    if (!pages[pageIndex]) {
      pages[pageIndex] = [];
    }

    pages[pageIndex].push({
      ...line,
      y: yInPage,
    });
  });

  return pages;
}

function createPages({ contentLines, title, instruction }) {
  const contentPages = paginateContent(contentLines);

  return contentPages.map((contentPage, index) => {
    const pageLines = [];

    drawHeaderName(pageLines);

    if (index === 0) {
      drawRememberBlock(pageLines, { instruction });
    }

    pageLines.push(...contentPage);
    drawFooter(pageLines, { title, pageNumber: index + 1 });

    return pageLines;
  });
}

function drawPageBase(doc, pageIndex) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");

  if (pageIndex === 0) {
    doc.setDrawColor(210, 210, 210);
    doc.roundedRect(PAGE.marginX, 74, 499, 52, 10, 10, "S");
  }
}

export async function createWorksheetPdf({ title = "Ficha", instruction = "Resuelve las actividades.", renderContent }) {
  const contentLines = [];

  if (typeof renderContent === "function") {
    renderContent(contentLines, {
      textLine,
      splitPdfText,
      contentStartY: CONTENT.startY,
      contentEndY: CONTENT.endY,
      page: PAGE,
    });
  }

  const pages = createPages({
    contentLines,
    title,
    instruction,
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [PAGE.width, PAGE.height],
  });

  await registerNeededFonts(doc, pages);

  pages.forEach((pageLines, index) => {
    if (index > 0) {
      doc.addPage([PAGE.width, PAGE.height], "portrait");
    }

    drawPageBase(doc, index);
    drawTextLines(doc, pageLines);
  });

  return doc.output("blob");
}

export function createPdfBlobUrl(pdfBlob) {
  if (!(pdfBlob instanceof Blob)) {
    throw new TypeError("El contenido del PDF no es un Blob válido.");
  }

  return URL.createObjectURL(pdfBlob);
}
