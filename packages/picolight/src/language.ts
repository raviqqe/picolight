import type { Token } from "./token.js";

// Patterns must be sticky to match only at given positions in text. Tokens of
// capture groups keyed by their numbers layer over the tokens of whole matches
// and need patterns to have the indices flag.
export type Lexer = [RegExp, Token[], Record<number, Token[]>?];

export type Language = { lexers: Lexer[] };
