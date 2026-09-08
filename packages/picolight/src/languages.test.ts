import { describe, expect, it } from "vitest";
import { lex } from "./highlight.js";
import { rust } from "./languages/rust.js";

describe("rust", () => {
  it("matches a comment", () => {
    const source = "// foo";

    expect(lex(source, rust, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a keyword before a comment", () => {
    expect(lex("fn // foo", rust, 0)).toEqual([[["keyword"], "fn"]]);
  });
});
