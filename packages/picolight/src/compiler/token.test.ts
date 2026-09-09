import { expect, it } from "vitest";
import { isToken } from "./token.ts";

it("accepts a token", () => {
  expect(isToken("keyword")).toBe(true);
});

it("rejects an unknown name", () => {
  expect(isToken("foo")).toBe(false);
});
