// cspell: ignore picklist
import { type InferOutput, picklist } from "valibot";

// Imported from Textmate.
export const tokenSchema = picklist([
  "bold",
  "brace",
  "carriage-return",
  "comment",
  "constant",
  "customrule",
  "delimiter",
  "emphasis",
  "entity",
  "header",
  "identifier",
  "invalid",
  "italic",
  "JSXNested",
  "keyword",
  "markup",
  "meta",
  "namespace",
  "none",
  "number",
  "object",
  "property",
  "prototype",
  "punctuation",
  "quote",
  "raw",
  "rgb-value",
  "source",
  "storage",
  "string",
  "strong",
  "support",
  "text",
  "variable",
]);

export type Token = InferOutput<typeof tokenSchema>;
