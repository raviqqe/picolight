import * as token from "../token.js";
import type { Language } from "../lexer.js";
import * as pattern from "../pattern.js";

export const scheme: Language = [
  [pattern.string, token.string],
  [pattern.parenthesis, token.punctuation],
];
