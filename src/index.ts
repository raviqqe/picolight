import type { Language, Lexer } from "./lexer.js";
import type { Theme } from "./theme.js";

const convertText = (text: string): Node => document.createTextNode(text);

export const highlight = (
  text: string,
  language: Language,
  theme: Theme,
): DocumentFragment => {
  const fragment = document.createDocumentFragment();

  while (text) {
    for (const [pattern, token] of [...language, [/./, null] satisfies Lexer]) {
      const match = pattern.exec(text)?.[0];

      if (match) {
        fragment.appendChild(((token && theme[token]) || convertText)(match));
        text = text.slice(match.length);
        break;
      }
    }
  }

  return fragment;
};
