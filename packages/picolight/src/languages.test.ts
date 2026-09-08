import { describe, expect, it } from "vitest";
import { lex } from "./highlight.js";
import { rust } from "./languages/rust.js";
import { typescript } from "./languages/typescript.js";

describe("rust", () => {
  it("matches a comment", () => {
    const source = "// foo";

    expect(lex(source, rust, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a keyword before a comment", () => {
    expect(lex("fn // foo", rust, 0)).toEqual([[["keyword"], "fn"]]);
  });
});

describe("typescript", () => {
  it("matches a number", () => {
    expect(lex("42", typescript, 0)).toEqual([[["constant"], "42"]]);
  });

  it("matches an import keyword", () => {
    expect(lex('import { x } from "y";', typescript, 0)).toEqual([
      [["keyword"], "import"],
    ]);
  });

  it("matches a from keyword", () => {
    expect(lex('from "y";', typescript, 0)).toEqual([[["keyword"], "from"]]);
  });

  it("matches a constant declaration", () => {
    expect(lex("const x = 1;", typescript, 0)).toEqual([
      [["storage"], "const"],
      [[], " "],
    ]);
  });

  it("matches a function declaration", () => {
    expect(lex("function foo() {}", typescript, 0)).toEqual([
      [["storage"], "function"],
      [[], " "],
      [["entity"], "foo"],
    ]);
  });

  it("matches a primitive type", () => {
    expect(lex("number", typescript, 0)).toEqual([[["support"], "number"]]);
  });
});
