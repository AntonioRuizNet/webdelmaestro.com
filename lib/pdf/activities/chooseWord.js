import { addActivityTitle, addChips, addInstruction, addText, SECTION_GAP } from "./helpers";

export function renderChooseWord(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Elige la palabra correcta", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  const items = activity.items || [];

  items.forEach((item) => {
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

    y = addText(contentLines, helpers, item.sentence || item.text || "", {
      y,
      maxLength: 86,
      gap: 24,
    });

    y -= 18;
  });

  return y - SECTION_GAP;
}
