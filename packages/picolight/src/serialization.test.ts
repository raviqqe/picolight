import { expect, it } from "vitest";
import { scheme } from "./languages/scheme.js";
import { typescript } from "./languages/typescript.js";
import { deserializeLanguage, serializeLanguage } from "./serialization.js";

for (const language of [scheme, typescript]) {
  it("serializes and deserializes languages", () => {
    expect(deserializeLanguage(serializeLanguage(language))).toEqual(language);
  });
}
