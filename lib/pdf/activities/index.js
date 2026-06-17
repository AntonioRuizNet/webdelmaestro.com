import { renderTextLines } from "./textLines";
import { renderWordBankParagraph } from "./wordBankParagraph";
import { renderOddOneOutGroups } from "./oddOneOutGroups";
import { renderChooseWord } from "./chooseWord";
import { renderChooseAnswer } from "./chooseAnswer";
import { renderMatchingColumns } from "./matchingColumns";
import { renderReadingComprehension } from "./readingComprehension";
import { renderFillBlanks } from "./fillBlanks";
import { renderDrawingBox } from "./drawingBox";

export { renderTextLines } from "./textLines";

export const ACTIVITY_RENDERERS = {
  textLines: renderTextLines,
  wordBankParagraph: renderWordBankParagraph,
  oddOneOutGroups: renderOddOneOutGroups,
  chooseWord: renderChooseWord,
  chooseAnswer: renderChooseAnswer,
  matchingColumns: renderMatchingColumns,
  readingComprehension: renderReadingComprehension,
  fillBlanks: renderFillBlanks,
  drawingBox: renderDrawingBox,
};
