import { describe, expect, it } from "vitest";
import { lex } from "../highlight.js";
import { typescript } from "./typescript.js";

describe("comment", () => {
  it("matches a comment", () => {
    const source = "/***/";
    expect(lex(source, typescript.lexers)).toEqual([["comment"], source]);
  });

  it("matches a multi-line comment", () => {
    const source = "/*foo\nbar\nbaz*/";

    expect(lex(source, typescript.lexers)).toEqual([["comment"], source]);
  });
});
