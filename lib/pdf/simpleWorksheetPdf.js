function sanitizePdfText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\\]/g, (match) => `\\${match}`)
    .replace(/[^\x20-\x7E]/g, '');
}

function textLine({ x, y, text, size = 12, font = 'F1' }) {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${sanitizePdfText(text)}) Tj ET`;
}

function createPdfDocument(lines) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const objects = [];
  const stream = lines.join('\n');

  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>');
  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function splitText(text, maxLength = 62) {
  const words = sanitizePdfText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

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
  return lines.length ? lines : [''];
}

export function createPdfBlobUrl(pdfContent) {
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export function createPrintableListPdf({ title, subtitle, items = [], instruction = 'Completa la actividad.' }) {
  const lines = [];
  lines.push('q 1 1 1 rg 0 0 595.28 841.89 re f Q');
  lines.push(textLine({ x: 48, y: 795, text: title, size: 18, font: 'F1' }));
  lines.push(textLine({ x: 48, y: 768, text: 'Nombre: ___________________________________________    Fecha: _____ / _____ / ________', size: 11, font: 'F1' }));
  if (subtitle) lines.push(textLine({ x: 48, y: 742, text: subtitle, size: 10, font: 'F1' }));
  lines.push(textLine({ x: 48, y: 724, text: instruction, size: 10, font: 'F1' }));

  let y = 690;
  items.slice(0, 24).forEach((item, index) => {
    const wrapped = splitText(`${index + 1}. ${item}`, 72);
    wrapped.forEach((line, lineIndex) => {
      lines.push(textLine({ x: 58, y: y - lineIndex * 15, text: line, size: 13, font: 'F1' }));
    });
    y -= Math.max(34, wrapped.length * 16 + 12);
  });

  lines.push(textLine({ x: 48, y: 34, text: 'webdelmaestro.com', size: 9, font: 'F1' }));
  return createPdfDocument(lines);
}

export function createHandwritingPdf({ title, text }) {
  const lines = [];
  const contentLines = splitText(text, 70).slice(0, 8);
  lines.push('q 1 1 1 rg 0 0 595.28 841.89 re f Q');
  lines.push(textLine({ x: 48, y: 795, text: title, size: 18, font: 'F1' }));
  lines.push(textLine({ x: 48, y: 768, text: 'Nombre: ___________________________________________    Fecha: _____ / _____ / ________', size: 11, font: 'F1' }));
  lines.push(textLine({ x: 48, y: 742, text: 'Copia el texto cuidando la letra y la separacion.', size: 10, font: 'F1' }));

  let y = 700;
  contentLines.forEach((line) => {
    lines.push(textLine({ x: 58, y, text: line, size: 14, font: 'F1' }));
    y -= 28;
    for (let i = 0; i < 3; i += 1) {
      lines.push(`0.82 0.82 0.82 RG 58 ${y} m 535 ${y} l S`);
      y -= 26;
    }
    y -= 10;
  });

  lines.push(textLine({ x: 48, y: 34, text: 'webdelmaestro.com', size: 9, font: 'F1' }));
  return createPdfDocument(lines);
}
