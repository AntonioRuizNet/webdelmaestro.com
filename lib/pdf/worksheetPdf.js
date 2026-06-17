import { jsPDF } from "jspdf";

const COLORS = {
  primary: [70, 162, 141],
  primaryDark: [56, 124, 108],
  primarySoft: [240, 250, 247],
  accent: [255, 209, 118],
  text: [30, 30, 30],
  muted: [110, 110, 110],
  border: [218, 218, 218],
  borderDark: [180, 180, 180],
  white: [255, 255, 255],
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 38,
  footerY: 48,
};

const CONTENT = {
  startY: 635,
  endY: 100,
};

const FONT_FILES = {
  F1: { file: null, family: "helvetica", style: "normal" },
  F1B: { file: null, family: "helvetica", style: "bold" },
  F2: { file: null, family: "courier", style: "normal" },
  F2B: { file: null, family: "courier", style: "bold" },
  Escolar_P: { file: "/fonts/Escolar_P.TTF", family: "Escolar_P", style: "normal" },
  ColeCarreira: { file: "/fonts/ColeCarreira.TTF", family: "ColeCarreira", style: "normal" },
  Escolar_G: { file: "/fonts/Escolar_G.TTF", family: "Escolar_G", style: "normal" },
  Escolar_GB: { file: "/fonts/Escolar_G.TTF", family: "Escolar_G", style: "bold" },
};

function textLine({ x, y, text, size = 12, font = "Escolar_P", color = COLORS.text, align = "left", maxWidth }) {
  return {
    type: "text",
    x,
    y,
    text: String(text || ""),
    size,
    font,
    color,
    align,
    maxWidth,
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

function toTopY(y) {
  return PAGE.height - y;
}

function setColor(doc, method, color) {
  const [r, g, b] = color || COLORS.text;
  doc[method](r, g, b);
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
  return FONT_FILES[fontKey] || FONT_FILES.Escolar_G;
}

function drawPageItems(doc, lines) {
  lines.forEach((line) => {
    if (!line) return;

    if (line.type === "rect") {
      setColor(doc, "setDrawColor", line.drawColor || COLORS.border);
      if (line.fillColor) setColor(doc, "setFillColor", line.fillColor);
      doc.setLineWidth(line.lineWidth || 0.8);

      const style = line.style || (line.fillColor ? "FD" : "S");
      doc.roundedRect(line.x, toTopY(line.y), line.width, line.height, line.radius || 0, line.radius || 0, style);
      return;
    }

    if (line.type === "line") {
      setColor(doc, "setDrawColor", line.color || COLORS.border);
      doc.setLineWidth(line.lineWidth || 0.6);
      doc.line(line.x1, toTopY(line.y1), line.x2, toTopY(line.y2));
      return;
    }

    if (line.type !== "text") return;

    const fontConfig = getFontConfig(line.font);

    doc.setFont(fontConfig.family, fontConfig.style);
    doc.setFontSize(line.size);
    setColor(doc, "setTextColor", line.color || COLORS.text);

    const options = {
      align: line.align || "left",
    };

    if (line.maxWidth) {
      options.maxWidth = line.maxWidth;
    }

    doc.text(line.text, line.x, toTopY(line.y), options);
  });

  setColor(doc, "setTextColor", COLORS.text);
}

function drawHeaderName(lines) {
  lines.push(
    textLine({
      x: PAGE.marginX,
      y: 780,
      text: "Nombre:",
      size: 16,
      font: "Escolar_G",
    }),
  );

  lines.push(
    textLine({
      x: 395,
      y: 780,
      text: "Fecha:",
      size: 16,
      font: "Escolar_G",
    }),
  );
}

function drawTitle(lines, { title }) {
  lines.push(
    textLine({
      x: PAGE.width / 2,
      y: 733,
      text: String(title || "Ficha").toUpperCase(),
      size: 22,
      font: "Escolar_G",
      color: COLORS.primary,
      align: "center",
      maxWidth: PAGE.width - PAGE.marginX * 2,
    }),
  );
}

function drawRememberBlock(lines, { instruction }) {
  lines.push(
    textLine({
      x: PAGE.marginX + 18,
      y: 700,
      text: "Recuerda",
      size: 16,
      font: "Escolar_G",
      color: COLORS.primaryDark,
    }),
  );

  const instructionLines = splitPdfText(instruction, 78).slice(0, 3);

  instructionLines.forEach((line, index) => {
    lines.push(
      textLine({
        x: PAGE.marginX + 18,
        y: 680 - index * 17,
        text: line,
        size: 14,
        font: "Escolar_G",
        color: COLORS.text,
      }),
    );
  });
}

function drawFooter(lines, { pageNumber = 1 }) {
  lines.push(
    textLine({
      x: PAGE.marginX,
      y: PAGE.footerY,
      text: "webdelmaestro.com",
      size: 12,
      font: "Escolar_G",
      color: COLORS.primaryDark,
    }),
  );

  lines.push(
    textLine({
      x: PAGE.width / 2,
      y: PAGE.footerY,
      text: "Material fotocopiable",
      size: 12,
      font: "Escolar_G",
      color: COLORS.muted,
      align: "center",
    }),
  );

  lines.push(
    textLine({
      x: PAGE.width - PAGE.marginX,
      y: PAGE.footerY,
      text: `Página ${pageNumber}`,
      size: 12,
      font: "Escolar_G",
      color: COLORS.muted,
      align: "right",
    }),
  );
}

function paginateContent(contentLines) {
  const FIRST_PAGE = {
    startY: CONTENT.startY,
    endY: CONTENT.endY,
  };

  const NEXT_PAGES = {
    startY: 725,
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
      drawTitle(pageLines, { title });
      drawRememberBlock(pageLines, { instruction });
    } else {
      pageLines.push(
        textLine({
          x: PAGE.width / 2,
          y: 760,
          text: String(title || "Ficha").toUpperCase(),
          size: 14,
          font: "Escolar_G",
          color: COLORS.primary,
          align: "center",
          maxWidth: PAGE.width - PAGE.marginX * 2,
        }),
      );
    }

    pageLines.push(...contentPage);
    drawFooter(pageLines, { pageNumber: index + 1 });

    return pageLines;
  });
}

function drawPageFrame(doc) {
  setColor(doc, "setDrawColor", COLORS.border);
  doc.setLineWidth(0.8);
  doc.roundedRect(22, 22, PAGE.width - 44, PAGE.height - 54, 10, 10, "S");

  // Pequeño detalle decorativo tipo esquina doblada.
  setColor(doc, "setDrawColor", COLORS.borderDark);
  setColor(doc, "setFillColor", [245, 245, 245]);
  doc.triangle(PAGE.width - 48, 22, PAGE.width - 22, 22, PAGE.width - 22, 48, "FD");
  doc.line(PAGE.width - 48, 22, PAGE.width - 22, 48);
}

function drawHeaderBase(doc) {
  setColor(doc, "setDrawColor", COLORS.text);
  doc.setLineWidth(1);
  doc.line(PAGE.marginX + 62, 64, 365, 64);
  doc.line(447, 64, PAGE.width - PAGE.marginX, 64);
}

function drawRememberBase(doc) {
  const x = PAGE.marginX;
  const y = 126;
  const width = PAGE.width - PAGE.marginX * 2;
  const height = 50;

  setColor(doc, "setFillColor", COLORS.primarySoft);
  setColor(doc, "setDrawColor", COLORS.border);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, width, height, 12, 12, "FD");

  setColor(doc, "setFillColor", COLORS.primary);
  doc.roundedRect(x, y, 7, height, 4, 4, "F");

  setColor(doc, "setFillColor", COLORS.accent);
  doc.circle(x + width - 22, y + 20, 5, "F");
}

function drawFooterBase(doc) {
  setColor(doc, "setDrawColor", COLORS.border);
  doc.setLineWidth(0.6);
  doc.line(PAGE.marginX, PAGE.height - 70, PAGE.width - PAGE.marginX, PAGE.height - 70);
}

function drawPageBase(doc, pageIndex) {
  setColor(doc, "setFillColor", COLORS.white);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");

  drawPageFrame(doc);
  drawHeaderBase(doc);
  drawFooterBase(doc);

  if (pageIndex === 0) {
    drawRememberBase(doc);
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
    drawPageItems(doc, pageLines);
  });

  return doc.output("blob");
}

export function createPdfBlobUrl(pdfBlob) {
  if (!(pdfBlob instanceof Blob)) {
    throw new TypeError("El contenido del PDF no es un Blob válido.");
  }

  return URL.createObjectURL(pdfBlob);
}
