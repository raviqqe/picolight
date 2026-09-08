import type { Language } from "../language.js";
import { identifier, keyword, parenthesis, surround } from "../pattern.js";

const identifierLetter = "[\\w$]";
const name = `[A-Za-z_$]${identifierLetter}*`;
// An assignment of an arrow function or a function expression.
const functionAssignment =
  "(?=\\s*=\\s*(?:async\\s+)?(?:function\\b|(?:\\([^()]*\\)|[\\w$]+)\\s*(?::[^=]*)?=>))";

const keywords = [
  "as",
  "await",
  "break",
  "case",
  "catch",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "finally",
  "for",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "of",
  "return",
  "switch",
  "throw",
  "try",
  "typeof",
  "void",
  "while",
  "with",
  "yield",
];

const storages = [
  "class",
  "const",
  "constructor",
  "extends",
  "function",
  "let",
  "var",
];

export const javascript: Language = [
  [surround(/\/\//, /[^\n]/, /\n/), ["comment"]],
  [surround(/\/\*/, /[^*]|\*(?!\/)/, /\*\//), ["comment"]],
  [/"(?:[^"\\\n]|\\[\s\S])*"?/y, ["string"]],
  [/'(?:[^'\\\n]|\\[\s\S])*'?/y, ["string"]],
  [surround(/`/, /[^`\\]|\\[\s\S]/, /`/), ["string"]],
  [
    /(?<=^\s*|[\n=(:,[?!&|{};+\-*%<>~^]\s*|\b(?:await|case|delete|do|else|in|instanceof|new|of|return|throw|typeof|void|yield)\s+)\/(?![*/])(?:[^\\/\n[]|\\[^\n]|\[(?:[^\]\\\n]|\\[^\n])*\])+\/([a-z]*)/dy,
    ["string"],
    { 1: ["keyword"] },
  ],
  [
    /0[box][\da-f_]+n?|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?n?/iy,
    ["number", "constant"],
  ],
  [/\.\.\./y, ["keyword"]],
  [
    /(\??\.)\s*(constructor|exports|length|prototype)(?![\w$])/dy,
    [],
    { 1: ["punctuation"], 2: ["support"] },
  ],
  [
    new RegExp(`(\\??\\.)\\s*(${name})(?=\\s*\\(|${functionAssignment})`, "dy"),
    [],
    { 1: ["punctuation"], 2: ["entity"] },
  ],
  [new RegExp(`(\\??\\.)\\s*${name}`, "dy"), [], { 1: ["punctuation"] }],
  [
    keyword(
      ["false", "Infinity", "NaN", "null", "true", "undefined"],
      identifierLetter,
    ),
    ["constant"],
  ],
  [/from(?=\s+["'])/y, ["keyword"]],
  [keyword(keywords, identifierLetter), ["keyword"]],
  [keyword(storages, identifierLetter), ["storage"]],
  [/(?:async|get|set|static)(?=\s+[\w$([{*#])/y, ["storage"]],
  [keyword(["arguments", "super", "this"], identifierLetter), ["variable"]],
  [/(?:exports|module|Promise(?=\s*\.))(?![\w$])/y, ["support"]],
  [new RegExp(`(?<=\\b(?:class|extends|new)\\s+)${name}`, "y"), ["entity"]],
  [new RegExp(`${name}(?=\\s*\\(|${functionAssignment})`, "y"), ["entity"]],
  [new RegExp(`(?<=\\bconst\\s+)${name}`, "y"), ["constant"]],
  // A capitalized name with a lowercase letter is a type unless it is accessed
  // as an object.
  [/[A-Z](?:[\w$]*[a-z][\w$]*)?(?![\w$]|\s*\??\.)/y, ["entity"]],
  [identifier("[A-Za-z_$]", identifierLetter), []],
  [/=>/y, ["storage"]],
  [/[-+*/%&|^~!<>=?]+/y, ["keyword"]],
  [parenthesis, ["punctuation"]],
  [/[;,.:]/y, ["punctuation"]],
];
