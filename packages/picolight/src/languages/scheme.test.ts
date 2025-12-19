import { describe, expect, it } from "vitest";
import { lex } from "../highlight.js";
import { scheme } from "./scheme.js";

describe("constant", () => {
  for (const text of [
    "#t",
    "#f",
    "#true",
    "#false",
    "#\\a",
    "#\\z",
    "#\\space",
    "#\\newline",
  ]) {
    it(`matches ${text}`, () => {
      expect(lex(text, scheme.lexers)).toEqual([["constant"], text]);
    });
  }
});

describe("comment", () => {
  it("matches a comment", () => {
    const source = "#|||#";
    expect(lex(source, scheme.lexers)).toEqual([["comment"], source]);
  });

  it("matches a multi-line comment", () => {
    const source = "#|foo\nbar\nbaz|#";

    expect(lex(source, scheme.lexers)).toEqual([["comment"], source]);
  });
});
