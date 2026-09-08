import { describe, expect, it } from "vitest";
import { lex } from "./highlight.js";
import { rust } from "./languages/rust.js";
import { scheme } from "./languages/scheme.js";

describe("rust", () => {
  it("matches a comment", () => {
    const source = "// foo";

    expect(lex(source, rust.lexers, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a keyword before a comment", () => {
    expect(lex("fn // foo", rust.lexers, 0)).toEqual([[["keyword"], "fn"]]);
  });
});

describe("scheme", () => {
  it("matches a comment", () => {
    const source = "; foo\n";

    expect(lex(source, scheme.lexers, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a block comment", () => {
    const source = "#|foo\nbar|#";

    expect(lex(source, scheme.lexers, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a string", () => {
    const source = '"foo\\"bar"';

    expect(lex(source, scheme.lexers, 0)).toEqual([[["string"], source]]);
  });

  it("matches a parenthesis", () => {
    expect(lex("(", scheme.lexers, 0)).toEqual([[["punctuation"], "("]]);
  });

  it("matches a keyword after a parenthesis", () => {
    expect(lex("(define x)", scheme.lexers, 1)).toEqual([
      [["keyword"], "define"],
    ]);
  });
});
