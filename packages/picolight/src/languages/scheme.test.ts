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
      expect(lex(text, scheme, 0)).toEqual([[["constant"], text]]);
    });
  }
});

describe("comment", () => {
  it("matches a comment", () => {
    const source = "; foo\n";

    expect(lex(source, scheme, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a comment to the end", () => {
    const source = "; foo";

    expect(lex(source, scheme.lexers, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a block comment", () => {
    const source = "#|||#";

    expect(lex(source, scheme, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a multi-line block comment", () => {
    const source = "#|foo\nbar\nbaz|#";

    expect(lex(source, scheme, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a block comment to the end", () => {
    const source = "#| foo";

    expect(lex(source, scheme.lexers, 0)).toEqual([[["comment"], source]]);
  });
});

describe("string", () => {
  it("matches a string with an escape", () => {
    const source = '"foo\\"bar"';

    expect(lex(source, scheme, 0)).toEqual([[["string"], source]]);
  });
});

describe("punctuation", () => {
  it("matches a parenthesis", () => {
    expect(lex("(", scheme, 0)).toEqual([[["punctuation"], "("]]);
  });
});

describe("keyword", () => {
  it("matches a keyword after a parenthesis", () => {
    expect(lex("(define x)", scheme, 1)).toEqual([[["keyword"], "define"]]);
  });
});
