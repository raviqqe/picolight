import type { Language, Lexer } from "./language.js";
import type { Theme } from "./theme.js";
import type { Token } from "./token.js";

export const highlight = (
  text: string,
  { lexers }: Language,
  theme: Theme,
): HTMLElement => {
  lexers = [...lexers, [/./sy, []] satisfies Lexer];
  const root = document.createElement("span");
  root.style = `color:${theme.fore}`;
  let index = 0;

  while (index < text.length) {
    const [tokens, match] = lex(text, lexers, index);

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
    index += match.length;
  }

  return root;
};

export const lex = (
  text: string,
  lexers: Lexer[],
  index: number,
): [Token[], string] => {
  for (const [pattern, tokens] of lexers) {
    pattern.lastIndex = index;
    const match = pattern.exec(text)?.[0];

    if (match) {
      return [tokens, match];
    }
  }

  throw new Error("No match");
};
