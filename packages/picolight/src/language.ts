import type { Token } from "./token.js";

export type Lexer = [
  pattern: RegExp,
  tokens: Token[],
  captures?: Record<number, Token[]>,
];

export type Language = { lexers: Lexer[] };
