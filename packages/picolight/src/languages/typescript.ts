import type { Language } from "../language.js";
import { keyword } from "../pattern.js";
import { javascript } from "./javascript.js";

const identifierLetter = "[\\w$]";

export const typescript: Language = [
  [keyword(["enum", "implements", "interface"], identifierLetter), ["storage"]],
  [
    /(?:abstract|declare|module|namespace|override|private|protected|public|readonly|type)(?=\s+[\w$"'{[(*#])/y,
    ["storage"],
  ],
  [
    keyword(
      ["asserts", "infer", "is", "keyof", "satisfies", "unique"],
      identifierLetter,
    ),
    ["keyword"],
  ],
  [
    /(?:any|bigint|boolean|never|number|object|string|symbol|unknown|void)(?![\w$]|\s*\()/y,
    ["support"],
  ],
  // Type parameter brackets follow a name or another closing bracket directly.
  [/(?<=[\w$])<|(?<=[\w$\]>)])>+/y, ["punctuation"]],
  [/:/y, ["keyword"]],
  ...javascript,
];
