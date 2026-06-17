import { addActivityTitle, addChips, addInstruction, SECTION_GAP, addText } from "./helpers";

export function renderOddOneOutGroups(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Rodea la palabra que sobra", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  const groups = activity.groups || [];

  groups.forEach((group, index) => {
    const words = Array.isArray(group) ? group : group.words || [];
    y = addText(contentLines, helpers, `Grupo ${index + 1}`, {
      y,
      maxLength: 80,
      gap: 27,
    });
    y = addChips(contentLines, helpers, words, {
      y,
      maxWidth: helpers.page.width - helpers.page.marginX * 2,
      gapX: 18,
      gapY: 3,
      minWidth: 78,
      maxChipWidth: 160,
      chipHeight: 30,
      radius: 15,
      paddingX: 14,
    });

    y -= 18;
  });

  return y - SECTION_GAP;
}
