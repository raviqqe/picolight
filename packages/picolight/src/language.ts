import type { Token } from "./token.js";

export type Lexer = [RegExp, Token[]];

export type Language = { lexers: Lexer[] };
