import type { Language, Lexer } from "./language.js";
import type { Theme } from "./theme.js";
import type { Token } from "./token.js";

export const highlight = (
  text: string,
  { lexers }: Language,
  theme: Theme,
): HTMLElement => {
  lexers = [...lexers, [/./sy, []]];
  const root = document.createElement("span");
  root.style = `color:${theme.fore}`;
  let index = 0;

  while (index < text.length) {
    for (const [tokens, match] of lex(text, lexers, index)) {
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
  }

  return root;
};

export const lex = (
  text: string,
  lexers: Lexer[],
  index: number,
): [Token[], string][] => {
  for (const [pattern, tokens, captures] of lexers) {
    pattern.lastIndex = index;
    const match = pattern.exec(text);

    if (match?.[0]) {
      return split(match, tokens, captures ?? {});
    }
  }

  throw new Error("No match");
};

const split = (
  match: RegExpExecArray,
  tokens: Token[],
  captures: Record<number, Token[]>,
): [Token[], string][] => {
  const start = match.index;
  const end = start + match[0].length;
  const ranges = Object.entries(captures)
    .flatMap(([index, tokens]): [[number, number], Token[]][] => {
      const range = match.indices?.[Number(index)];

      return range && range[0] < range[1] ? [[range, tokens]] : [];
    })
    .toReversed();
  const bounds = [
    ...new Set([start, end, ...ranges.flatMap(([range]) => range)]),
  ]
    .filter((bound) => bound >= start && bound <= end)
    .toSorted((one, other) => one - other);

  return bounds.slice(1).map((end, index) => {
    const start = bounds[index] ?? end;

    return [
      [
        ...ranges
          .filter(([[first, last]]) => first <= start && end <= last)
          .flatMap(([, tokens]) => tokens),
        ...tokens,
      ],
      match.input.slice(start, end),
    ];
  });
};
