import { string, number, parenthesis } from "../pattern.js";
import type { Language } from "../language.js";

export const scheme: Language = [
  [number, "constant"],
  [string, "string"],
  [parenthesis, "punctuation"],
];
