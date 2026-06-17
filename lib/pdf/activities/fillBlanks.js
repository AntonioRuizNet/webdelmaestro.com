import { addActivityTitle, addInstruction, addText, SECTION_GAP } from "./helpers";

export function renderFillBlanks(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Completa", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  const lines = activity.lines || activity.sentences || [];

  lines.forEach((line, index) => {
    y = addText(contentLines, helpers, `${index + 1}. ${line}`, { y, maxLength: 88, gap: 28 });
    y -= 12;
  });

  return y - SECTION_GAP;
}
