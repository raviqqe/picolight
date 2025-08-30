import type { Language } from "../language.js";
import { keyword, number, parenthesis, string } from "../pattern.js";

export const scheme: Language = {
  lexers: [
    [/^(false|true)(?![A-Za-z0-9])/, ["constant"]],
    [number, ["number", "constant"]],
    [string, ["string"]],
    [parenthesis, ["punctuation"]],
    [keyword(builtins), ["variable"]],
    [keyword(syntaxes), ["keyword"]],
    [/^#;/, ["punctuation"]],
    [/^;[^\n]*\n/s, ["comment"]],
  ],
};
