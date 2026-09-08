import { expect, it } from "vitest";
import type { Language } from "./language.js";
import { scheme } from "./languages/scheme.js";
import { typescript } from "./languages/typescript.js";
import { deserializeLanguage, serializeLanguage } from "./serialization.js";

for (const language of [scheme, typescript]) {
  it("serializes and deserializes languages", () => {
    expect(deserializeLanguage(serializeLanguage(language))).toEqual(language);
  });
}

it("serializes and deserializes a lexer with captures", () => {
  const language: Language = [[/(foo)/dvy, [], { 1: ["keyword"] }]];

  expect(deserializeLanguage(serializeLanguage(language))).toEqual(language);
});
