import type { Language } from "../language.js";
import * as pattern from "../pattern.js";

export const scheme: Language = [
  [pattern.number, "constant"],
  [pattern.string, "string"],
  [pattern.parenthesis, "punctuation"],
];
