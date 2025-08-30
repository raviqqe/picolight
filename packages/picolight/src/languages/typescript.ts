import type { Language } from "../language.js";
import { keyword, number, parenthesis, string } from "../pattern.js";

const identifierLetter = "[A-Za-z0-9_]";

export const typescript: Language = {
  lexers: [
    [keyword(["false", "true"], identifierLetter), ["constant"]],
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
          "else",
          "export",
          "for",
          "from",
          "function",
          "if",
          "import",
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
