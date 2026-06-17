import { addActivityTitle, addInstruction, addText, COLORS, SMALL_TEXT_SIZE, SECTION_GAP } from "./helpers";

export function renderChooseAnswer(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Elige la respuesta correcta", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  const items = activity.items || activity.questions || [];

  items.forEach((item, index) => {
    y = addText(contentLines, helpers, `${index + 1}. ${item.question || item.sentence || item.text || ""}`, { y, maxLength: 86, gap: 25 });

    if (Array.isArray(item.options) && item.options.length) {
      y = addText(contentLines, helpers, item.options.map((option) => `□ ${option}`).join("      "), {
        y,
        size: SMALL_TEXT_SIZE,
        color: COLORS.primaryDark,
        maxLength: 98,
        gap: 21,
        indent: 14,
      });
    }

    y -= 10;
  });

  return y - SECTION_GAP;
}
