import { expect, it } from "vitest";

it("matches a comment", () => {
  expect(match()).toEqual(["comment"]);
});
