import type { Language } from "../language.js";
import { number, parenthesis, string } from "../pattern.js";

export const scheme: Language = [
  [number, "constant"],
  [string, "string"],
  [parenthesis, "punctuation"],
];
