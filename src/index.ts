import type { Pattern } from "./pattern.js";

export const highlight = (
  text: string,
  patterns: Pattern[],
): DocumentFragment => {
  const fragment = document.createDocumentFragment();

  while (text) {
    for (const [pattern, convert] of [
      ...patterns,
      [/./, (text) => document.createTextNode(text)] satisfies Pattern,
    ]) {
      const match = pattern.exec(text)?.[0];

      if (match) {
        fragment.appendChild(convert(match));
        text = text.slice(match.length);
        break;
      }
    }
  }

  return fragment;
};
