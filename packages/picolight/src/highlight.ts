import type { Language, Lexer } from "./language.js";
import type { Theme } from "./theme.js";
import { Token } from "./token.js";

export const highlight = (
  text: string,
  { lexers }: Language,
  theme: Theme,
): HTMLElement => {
  const root = document.createElement("span");
  root.style = `color:${theme.fore}`;

  while (text) {
    for (const [pattern, tokens] of [...lexers, [/./s, []] satisfies Lexer]) {
      const match = pattern.exec(text)?.[0];

      if (match) {
        const style = tokens
          .values()
          .map((token) => theme.tokens[token])
          .find(Boolean);
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

export const match = (
  text: string,
  lexers: Lexer[],
): [Token[], string] | null => {
  for (const [pattern, tokens] of lexers) {
    const match = pattern.exec(text)?.[0];

    if (match) {
      return [tokens, match];
    }
  }

  return null;
};
