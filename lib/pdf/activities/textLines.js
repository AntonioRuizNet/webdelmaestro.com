import { addActivityTitle, addInstruction, addText, formatSpacedNumbers, SECTION_GAP } from "./helpers";

export function renderTextLines(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Actividad", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  const lines = activity.lines || activity.items || [];

  lines.forEach((line) => {
    const text = formatSpacedNumbers(line);
    const isNumbers = text !== line;

    y = addText(contentLines, helpers, text, {
      y,
      maxLength: isNumbers ? 110 : 86,
      gap: isNumbers ? 32 : 28,
      size: isNumbers ? 18 : 15,
    });
    y -= isNumbers ? 16 : 10;
  });

  return y - SECTION_GAP;
}
