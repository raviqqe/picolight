import type { Language } from "../language.js";
import { keyword, number, parenthesis, string } from "../pattern.js";

const identifierLetter = "[A-Za-z0-9_]";

export const typescript: Language = {
  lexers: [
    [
      keyword(["false", "null", "true", "undefined"], identifierLetter),
      ["constant"],
    ],
    [/^(\.|,|:|;)/, ["punctuation"]],
    [number, ["number", "constant"]],
    [string, ["string"]],
    [parenthesis, ["punctuation"]],
    [
      keyword(
        [
          "async",
          "await",
          "break",
          "case",
          "catch",
          "class",
          "const",
          "continue",
          "default",
          "delete",
          "do",
          "else",
          "enum",
          "export",
          "finally",
          "for",
          "from",
          "function",
          "if",
          "import",
          "instanceof",
          "interface",
          "let",
          "return",
          "switch",
          "throw",
          "try",
          "type",
          "typeof",
          "var",
          "void",
          "while",
          "with",
          "yield",
        ],
        identifierLetter,
      ),
      ["keyword"],
    ],
    [keyword(["number", "string"], identifierLetter), ["storage"]],
    [keyword(["Promise", "RegExp", "URL"], identifierLetter), ["entity"]],
    [
      keyword(["console", "document", "window"], identifierLetter),
      ["variable"],
    ],
    [/^\/\*([^*]|\*(?!\/))*\*\//s, ["comment"]],
    [/^\/\/[^\n]*\n/, ["comment"]],
  ],
};
