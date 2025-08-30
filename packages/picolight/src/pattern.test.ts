import { describe, expect, it } from "vitest";
import { string } from "./pattern.js";

describe("string", () => {
  it("matches a string", () => {
    const text = `"foo"`;

    expect(text.match(string)?.[0]).toBe(text);
  });

  it("matches a string to the end", () => {
    const text = `"foo`;

    expect(text.match(string)?.[0]).toBe(text);
  });
});
