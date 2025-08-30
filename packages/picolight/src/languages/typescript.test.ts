import { expect, it } from "vitest";
import { lex } from "../highlight.js";
import { typescript } from "./typescript.js";

it("matches a comment", () => {
  expect(lex("/***/", typescript.lexers)).toEqual([["comment"], "/***/"]);
});
