import { addActivityTitle, addInstruction, addText, SECTION_GAP } from "./helpers";

export function renderDrawingBox(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, activity.label || "Dibuja", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  if (activity.prompt) {
    y = addText(contentLines, helpers, activity.prompt, { y, maxLength: 86, gap: 25 });
  }

  const height = activity.height || 120;
  return y - height - SECTION_GAP;
}
