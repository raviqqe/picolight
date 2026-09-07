import { describe, expect, it } from "vitest";
import { lex } from "../highlight.js";
import { rust } from "./experimental/rust.js";
import { scheme } from "./experimental/scheme.js";

describe("rust", () => {
  it("matches a comment", () => {
    const source = "// foo";

    expect(lex(source, rust.lexers)).toEqual([["comment"], source]);
  });

  it("matches a keyword before a comment", () => {
    expect(lex("fn // foo", rust.lexers)).toEqual([["keyword"], "fn"]);
  });
});

describe("scheme", () => {
  it("matches a comment", () => {
    const source = "; foo\n";

    expect(lex(source, scheme.lexers)).toEqual([["comment"], source]);
  });

  it("matches a block comment", () => {
    const source = "#|foo\nbar|#";

    expect(lex(source, scheme.lexers)).toEqual([["comment"], source]);
  });

  it("matches a string", () => {
    const source = '"foo\\"bar"';

    expect(lex(source, scheme.lexers)).toEqual([["string"], source]);
  });

  it("matches a parenthesis", () => {
    expect(lex("(", scheme.lexers)).toEqual([["punctuation"], "("]);
  });

  it("matches a keyword after a parenthesis", () => {
    expect(lex("(define x)", scheme.lexers, 1)).toEqual([
      ["keyword"],
      "define",
    ]);
  });
});
