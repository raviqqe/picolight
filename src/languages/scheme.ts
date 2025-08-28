import * as category from "../category.js";
import * as pattern from "../pattern.js";
import type { Language } from "../pattern.js";

export const scheme: Language = [
  [pattern.string, category.string],
  [pattern.parenthesis, category.punctuation],
];
