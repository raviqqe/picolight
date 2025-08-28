import type { Language, Lexer } from "./lexer.js";
import type { Theme } from "./theme.js";

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
        const style = (token && theme[token]) || theme[""];
        let node: Node = document.createTextNode(match);

        if (style) {
          const element = document.createElement(style[0] ?? "span");
          element.appendChild(node);
          element.setAttribute("color", style[1]);
          node = element;
        }

        fragment.appendChild(node);
        text = text.slice(match.length);
        break;
      }
    }
  }

  return fragment;
};
