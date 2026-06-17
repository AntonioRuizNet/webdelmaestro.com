import { addActivityTitle, addChips, addInstruction, addText, SECTION_GAP } from "./helpers";

export function renderWordBankParagraph(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Completa el texto", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  if (Array.isArray(activity.words) && activity.words.length) {
    y = addChips(contentLines, helpers, activity.words, {
      x: helpers.page.marginX,
      y,
      maxWidth: helpers.page.width - helpers.page.marginX * 2,
      container: true,
      containerPadding: 14,
      gapX: 16,
      gapY: 12,
      minWidth: 70,
      maxChipWidth: 155,
      chipHeight: 28,
      radius: 14,
    });
    y -= 8;
  }

  y = addText(contentLines, helpers, activity.text || "", {
    y,
    maxLength: 80,
    gap: 27,
  });

  if (activity.linesAfterText) {
    const lines = activity.linesAfterText || 2;
    for (let index = 0; index < lines; index += 1) {
      y = addText(contentLines, helpers, "________________________________________________________", { y, maxLength: 90, gap: 25 });
    }
  }

  return y - SECTION_GAP;
}
