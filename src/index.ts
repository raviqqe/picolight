import type { Language, Lexer } from "./lexer.js";
import type { Theme } from "./theme.js";

export type { Tag, Theme } from "./theme.js";

export const highlight = (
  text: string,
  language: Language,
  [color, theme]: Theme,
): HTMLElement => {
  const root = document.createElement("span");
  root.style = `color:${color}`;

  while (text) {
    for (const [pattern, token] of [...language, [/./, null] satisfies Lexer]) {
      const match = pattern.exec(text)?.[0];

      if (match) {
        const style = token && theme[token];
        let node: Node = document.createTextNode(match);

        if (style) {
          const element = document.createElement(style[0] ?? "span");

          if (style[1]) {
            element.style = `color:${style[1]}`;
          }

          element.appendChild(node);
          node = element;
        }

        root.appendChild(node);
        text = text.slice(match.length);
        break;
      }
    }
  }

  return root;
};
