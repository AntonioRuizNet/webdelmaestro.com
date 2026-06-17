import { addActivityTitle, addInstruction, addText, COLORS, SMALL_TEXT_SIZE, SECTION_GAP, addChips } from "./helpers";

export function renderChooseAnswer(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Elige la respuesta correcta", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  const items = activity.items || activity.questions || [];

  items.forEach((item, index) => {
    y = addText(contentLines, helpers, `${index + 1}. ${item.question || item.sentence || item.text || ""}`, {
      y,
      maxLength: 86,
      gap: 25,
    });

    if (Array.isArray(item.options) && item.options.length) {
      y = addChips(contentLines, helpers, item.options, {
        y,
        maxWidth: helpers.page.width - helpers.page.marginX * 2,
        gapX: 16,
        gapY: 12,
        minWidth: 70,
        maxChipWidth: 230,
        chipHeight: 28,
        radius: 14,
      });
      y -= 10;
    }

    y -= 10;
  });

  return y - SECTION_GAP;
}
