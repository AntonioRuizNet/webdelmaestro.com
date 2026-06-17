import { addActivityTitle, addInstruction, addText, addBlankLine, COLORS, SMALL_TEXT_SIZE, SECTION_GAP } from "./helpers";

export function renderReadingComprehension(activity, contentLines, helpers, y, activityNumber) {
  y = addActivityTitle(contentLines, helpers, activity, "Lee y responde", y, activityNumber);
  y = addInstruction(contentLines, helpers, activity, y);

  y = addText(contentLines, helpers, activity.text || "", {
    y,
    size: SMALL_TEXT_SIZE,
    color: COLORS.text,
    maxLength: 88,
    gap: 21,
  });

  y -= 12;

  const questions = activity.questions || [];

  questions.forEach((question, index) => {
    const text = typeof question === "string" ? question : question.text || question.question || "";
    y = addText(contentLines, helpers, `${index + 1}. ${text}`, { y, maxLength: 84, gap: 25 });
    y = addBlankLine(contentLines, helpers, y);
    y -= 12;
  });

  return y - SECTION_GAP;
}
