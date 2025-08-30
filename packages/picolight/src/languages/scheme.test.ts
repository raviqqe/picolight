import { expect, it } from "vitest";
import { lex } from "../highlight.js";
import { scheme } from "./scheme.js";

it("matches a comment", () => {
  const source = "#|||#";
  expect(lex(source, scheme.lexers)).toEqual([["comment"], source]);
});

it("matches a multi-line comment", () => {
  const source = "#|foo\nbar\nbaz|#";

  expect(lex(source, scheme.lexers)).toEqual([["comment"], source]);
});
