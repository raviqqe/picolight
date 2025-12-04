import { expect, it } from "vitest";
import { deserializeLanguage, serializeLanguage } from "./serialization.js";
import { typescript } from "./languages/typescript.js";
import { scheme } from "./languages/scheme.js";

for (const language of [scheme, typescript]) {
  it("serializes and deserializes languages", () => {
    expect(deserializeLanguage(serializeLanguage(language))).toEqual(language);
  });
}
