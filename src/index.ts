import type { Language, Lexer } from "./lexer.js";

export const highlight = (
  text: string,
  language: Language,
  theme: Record<string, (text: string) => foo>,
): DocumentFragment => {
  const fragment = document.createDocumentFragment();

  while (text) {
    for (const [pattern, convert] of [
      ...patterns,
      [/./, null] satisfies Lexer,
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
