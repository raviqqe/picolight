import type { Token } from "./token.js";

// Patterns must be sticky to match only at given positions in text.
export type Lexer = [RegExp, Token[]];

export type Language = { lexers: Lexer[] };
