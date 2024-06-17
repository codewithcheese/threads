import type { LexicalEditor } from "lexical";

export type MenuTextMatch = {
  leadOffset: number;
  matchingString: string;
  replaceableString: string;
};

export type MenuResolution = {
  match?: MenuTextMatch;
  getRect: () => DOMRect;
};

export type TriggerFn = (
  text: string,
  editor: LexicalEditor,
) => MenuTextMatch | null;

export const PUNCTUATION =
  "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%'\"~=<>_:;";

export function basicTypeaheadTriggerMatch(
  trigger: string,
  { minLength = 1, maxLength = 75 }: { minLength?: number; maxLength?: number },
): TriggerFn {
  return (text: string) => {
    const validChars = "[^" + trigger + PUNCTUATION + "\\s]";
    const TypeaheadTriggerRegex = new RegExp(
      "(^|\\s|\\()(" +
        "[" +
        trigger +
        "]" +
        "((?:" +
        validChars +
        "){0," +
        maxLength +
        "})" +
        ")$",
    );
    const match = TypeaheadTriggerRegex.exec(text);
    if (match !== null) {
      const maybeLeadingWhitespace = match[1];
      const matchingString = match[3];
      if (matchingString.length >= minLength) {
        return {
          leadOffset: match.index + maybeLeadingWhitespace.length,
          matchingString,
          replaceableString: match[2],
        };
      }
    }
    return null;
  };
}
