import * as category from "../category.js";
import { parenthesis, string } from "../pattern.js";
import type { Language } from "../pattern.js";

export const scheme: Language = [
  [string, category.string],
  [parenthesis, category.punctuation],
];
