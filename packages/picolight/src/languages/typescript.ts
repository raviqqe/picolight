import type { Language } from "../language.js";
import { keyword, number, parenthesis, string } from "../pattern.js";

const identifierLetter = "[A-Z-az0-9_]";

export const typescript: Language = {
  lexers: [
    [/^(false|true)(?![A-Za-z0-9])/, ["constant"]],
    [number, ["number", "constant"]],
    [string, ["string"]],
    [parenthesis, ["punctuation"]],
    [
      keyword(
        [
          "async",
          "await",
          "const",
          "do",
          "export",
          "else",
          "type",
          "for",
          "from",
          "function",
          "if",
          "import",
          "let",
          "var",
          "while",
        ],
        identifierLetter,
      ),
      ["keyword"],
    ],
    [/^#;/, ["punctuation"]],
    [/^;[^\n]*\n/s, ["comment"]],
  ],
};
