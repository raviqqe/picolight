import { expect, it } from "vitest";
import { string } from "./pattern.js";

it("matches a string to the end", () => {
  const text = `"foo`;

  expect(text.match(string)?.[0]).toBe(text);
});
