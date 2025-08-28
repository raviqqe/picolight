import { punctuation } from "../category.js";
import { parenthesis, string } from "../lexer.js";
import type { Pattern } from "../pattern.js";

export const scheme: Pattern[] = [
  [string, foo],
  [parenthesis, punctuation],
];
