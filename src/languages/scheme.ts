import type { Language } from "../language.js";
import * as pattern from "../pattern.js";
import * as token from "../token.js";

export const scheme: Language = [
  [pattern.number, token.number],
  [pattern.string, token.string],
  [pattern.parenthesis, token.punctuation],
];
