import { addActivityTitle, addInstruction, addText, COLORS, SECTION_GAP } from "./helpers";

export function renderMatchingColumns(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Une con flechas", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  const left = activity.left || [];
  const right = activity.right || [];
  const maxRows = Math.max(left.length, right.length);
  const leftX = helpers.page.marginX + 10;
  const rightX = helpers.page.width / 2 + 30;

  for (let index = 0; index < maxRows; index += 1) {
    const leftText = left[index] || "";
    const rightText = right[index] || "";

    y = addText(contentLines, helpers, `${index + 1}. ${leftText}`, {
      x: leftX,
      y,
      maxLength: 34,
      gap: 22,
    });

    contentLines.push(
      helpers.textLine({
        x: rightX,
        y: y + 22,
        text: `${String.fromCharCode(65 + index)}. ${rightText}`,
        size: 15,
        font: "Escolar_GB",
        color: COLORS.text,
      }),
    );

    y -= 12;
  }

  return y - SECTION_GAP;
}
