import { expect, it } from "vitest";
import { lex } from "../highlight.js";
import { scheme } from "./scheme.js";

it("matches a comment", () => {
  expect(lex("#|||#", scheme.lexers)).toEqual([["comment"], "#|||#"]);
});
