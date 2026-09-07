import { expect, it } from "vitest";
import { lex } from "../highlight.js";
import { rust } from "./experimental/rust.js";

it("matches a comment", () => {
  const source = "// foo";

  expect(lex(source, rust.lexers)).toEqual([["comment"], source]);
});

it("matches only a prefix of text", () => {
  expect(lex("fn // foo", rust.lexers)).toEqual([["keyword"], "fn"]);
});
