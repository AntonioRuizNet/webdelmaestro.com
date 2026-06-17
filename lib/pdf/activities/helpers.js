export const COLORS = {
  primary: [70, 162, 141],
  primaryDark: [56, 124, 108],
  primarySoft: [240, 250, 247],
  accentSoft: [255, 248, 232],
  text: [30, 30, 30],
  muted: [110, 110, 110],
  border: [218, 218, 218],
  white: [255, 255, 255],
};

export const DEFAULT_TEXT_SIZE = 15;
export const TITLE_SIZE = 16;
export const SMALL_TEXT_SIZE = 13;
export const LINE_HEIGHT = 24;
export const SECTION_GAP = 30;
export const CONTENT_FONT = "Escolar_GB";
export const TITLE_FONT = "Escolar_GB";
export const UI_FONT = "Escolar_GB";
export const UI_BOLD_FONT = "Escolar_GB";

export function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function addText(contentLines, helpers, text, options = {}) {
  const { textLine, splitPdfText, page } = helpers;
  const {
    x = page.marginX,
    y,
    size = DEFAULT_TEXT_SIZE,
    font = CONTENT_FONT,
    color = COLORS.text,
    maxLength = 82,
    gap = LINE_HEIGHT,
    indent = 0,
    align = "left",
    maxWidth,
  } = options;

  let currentY = y;
  const lines = splitPdfText(text, maxLength);

  lines.forEach((line) => {
    contentLines.push(
      textLine({
        x: x + indent,
        y: currentY,
        text: line,
        size,
        font,
        color,
        align,
        maxWidth,
      }),
    );
    currentY -= gap;
  });

  return currentY;
}

export function addRect(
  contentLines,
  helpers,
  { x, y, width, height, radius = 8, fillColor, drawColor = COLORS.border, lineWidth = 0.8, style = "S" },
) {
  contentLines.push({
    type: "rect",
    x,
    y,
    width,
    height,
    radius,
    fillColor,
    drawColor,
    lineWidth,
    style,
  });
}

export function addLine(contentLines, helpers, { x1, y1, x2, y2, color = COLORS.border, lineWidth = 0.6 }) {
  contentLines.push({
    type: "line",
    x1,
    y1,
    x2,
    y2,
    color,
    lineWidth,
  });
}

export function addActivityTitle(contentLines, helpers, activity, fallbackTitle, y, activityNumber) {
  const title = activity?.title || fallbackTitle;
  if (!title) return y;

  if (!activityNumber) {
    return addText(contentLines, helpers, title, { y, size: TITLE_SIZE, font: TITLE_FONT, maxLength: 70, gap: 24 }) - 4;
  }

  const x = helpers.page.marginX;
  contentLines.push(
    helpers.textLine({
      x,
      y,
      text: `${activityNumber}.`,
      size: TITLE_SIZE,
      font: TITLE_FONT,
      color: COLORS.primary,
    }),
  );

  return (
    addText(contentLines, helpers, title, {
      x: x + 26,
      y,
      size: TITLE_SIZE,
      font: TITLE_FONT,
      color: COLORS.text,
      maxLength: 66,
      gap: 24,
    }) - 4
  );
}

export function addInstruction(contentLines, helpers, activity, y) {
  if (!activity?.instruction) return y;

  return (
    addText(contentLines, helpers, activity.instruction, {
      y,
      size: SMALL_TEXT_SIZE,
      font: UI_FONT,
      color: COLORS.muted,
      maxLength: 88,
      gap: 19,
    }) - 4
  );
}

export function addBlankLine(contentLines, helpers, y, label = "") {
  const text = label
    ? `${label}: ________________________________________________`
    : "________________________________________________________";
  return addText(contentLines, helpers, text, { y, size: DEFAULT_TEXT_SIZE, maxLength: 90, gap: 25 });
}

export function addOptionalLines(contentLines, helpers, lines, y, options = {}) {
  normalizeArray(lines).forEach((line) => {
    y = addText(contentLines, helpers, line, { y, maxLength: 86, gap: options.gap || LINE_HEIGHT });
    y -= options.extraGap ?? 6;
  });

  return y;
}

function estimateChipWidth(label, size, paddingX, minWidth, maxWidth) {
  const text = String(label || "").trim();
  const estimated = text.length * size * 0.52 + paddingX * 2;
  return Math.max(minWidth, Math.min(maxWidth, estimated));
}

function buildChipRows(items, options) {
  const { maxWidth, size, paddingX, minWidth, maxChipWidth, gapX } = options;

  const rows = [];
  let currentRow = [];
  let currentWidth = 0;

  items.forEach((item) => {
    const label = String(item || "").trim();
    if (!label) return;

    const width = estimateChipWidth(label, size, paddingX, minWidth, maxChipWidth);
    const nextWidth = currentRow.length ? currentWidth + gapX + width : width;

    if (currentRow.length && nextWidth > maxWidth) {
      rows.push(currentRow);
      currentRow = [];
      currentWidth = 0;
    }

    currentRow.push({ label, width });
    currentWidth = currentRow.length === 1 ? width : currentWidth + gapX + width;
  });

  if (currentRow.length) rows.push(currentRow);

  return rows;
}

export function addChips(contentLines, helpers, items, options = {}) {
  const { page } = helpers;
  const words = normalizeArray(items);

  if (!words.length) return options.y;

  const {
    x = page.marginX,
    y,
    maxWidth = page.width - page.marginX * 2,
    size = SMALL_TEXT_SIZE,
    font = UI_BOLD_FONT,
    textColor = COLORS.primaryDark,
    fillColor = COLORS.white,
    drawColor = COLORS.primary,
    paddingX = 12,
    chipHeight = 26,
    radius = 12,
    gapX = 12,
    gapY = 12,
    minWidth = 56,
    maxChipWidth = 150,
    container = false,
    containerPadding = 12,
    containerRadius = 10,
    containerFillColor = COLORS.primarySoft,
    containerDrawColor = COLORS.primary,
  } = options;

  const availableWidth = container ? maxWidth - containerPadding * 2 : maxWidth;
  const rows = buildChipRows(words, {
    maxWidth: availableWidth,
    size,
    paddingX,
    minWidth,
    maxChipWidth,
    gapX,
  });

  const totalHeight = rows.length * chipHeight + Math.max(0, rows.length - 1) * gapY;
  const startX = container ? x + containerPadding : x;
  let currentY = container ? y - containerPadding : y;

  if (container) {
    addRect(contentLines, helpers, {
      x,
      y: y + 12,
      width: maxWidth,
      height: totalHeight + containerPadding * 2,
      radius: containerRadius,
      fillColor: containerFillColor,
      drawColor: containerDrawColor,
      lineWidth: 0.8,
      style: "FD",
    });
  }

  rows.forEach((row) => {
    let currentX = startX;

    row.forEach((chip) => {
      addRect(contentLines, helpers, {
        x: currentX,
        y: currentY + 10,
        width: chip.width,
        height: chipHeight,
        radius,
        fillColor,
        drawColor,
        lineWidth: 0.8,
        style: "FD",
      });

      contentLines.push(
        helpers.textLine({
          x: currentX + chip.width / 2,
          y: currentY - 8,
          text: chip.label,
          size,
          font,
          color: textColor,
          align: "center",
          maxWidth: chip.width - paddingX,
        }),
      );

      currentX += chip.width + gapX;
    });

    currentY -= chipHeight + gapY;
  });

  return container ? y - totalHeight - containerPadding * 2 - 18 : currentY - 4;
}

export function formatSpacedNumbers(text) {
  const value = String(text || "").trim();

  if (/^[0-9\s]+$/.test(value) && /\d/.test(value)) {
    return value.split(/\s+/).filter(Boolean).join("        ");
  }

  return text;
}
