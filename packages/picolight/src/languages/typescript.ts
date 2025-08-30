import type { Language } from "../language.js";
import { keyword, number, parenthesis, string } from "../pattern.js";

const identifierLetter = "[A-Za-z0-9_]";

export const typescript: Language = {
  lexers: [
    [
      keyword(["false", "null", "true", "undefined"], identifierLetter),
      ["constant"],
    ],
    [number, ["number", "constant"]],
    [string, ["string"]],
    [parenthesis, ["punctuation"]],
    [
      keyword(
        [
          "async",
          "class",
          "try",
          "catch",
          "finally",
          "break",
          "continue",
          "return",
          "with",
          "switch",
          "case",
          "default",
          "yield",
          "typeof",
          "instanceof",
          "enum",
          "delete",
          "await",
          "const",
          "do",
          "else",
          "export",
          "for",
          "from",
          "function",
          "if",
          "import",
          "interface",
          "let",
          "type",
          "var",
          "while",
        ],
        identifierLetter,
      ),
      ["keyword"],
    ],
    [/^#;/, ["punctuation"]],
    [/^\/*([^*]|[*](?!\/))*\//s, ["comment"]],
    [/^\/\/[^\n]*\n/, ["comment"]],
  ],
};
