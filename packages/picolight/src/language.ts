import type { Token } from "./token.js";

export type Lexer = [RegExp, Token | null];

export type Language = Lexer[];
