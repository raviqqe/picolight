import * as category from "../category.js";
import type { Language } from "../lexer.js";
import * as pattern from "../pattern.js";

export const scheme: Language = [
  [pattern.string, category.string],
  [pattern.parenthesis, category.punctuation],
];
