import { expect, it } from "vitest";
import { highlight } from "./index.js";
import { scheme } from "./languages/scheme.js";
import { githubDark } from "./themes/github-dark.js";

it("highlights code", () => {
  expect(highlight("foo", scheme, githubDark).outerHTML).toMatchSnapshot();
});

it("highlights a library syntax", () => {
  expect(
    highlight("(import (scheme base))", scheme, githubDark).outerHTML,
  ).toMatchSnapshot();
});

it("highlights a keyword", () => {
  expect(highlight("define", scheme, githubDark).outerHTML).toMatchSnapshot();
});

it("highlights a string with escapes", () => {
  expect(
    highlight(`"\\n\\r\\t\\\\\\""`, scheme, githubDark).outerHTML,
  ).toMatchSnapshot();
});
