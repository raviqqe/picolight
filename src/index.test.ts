import { expect, it } from "vitest";
import { highlight } from "./index.js";
import { githubDark } from "./themes/github-dark.js";

it("highlights code", () => {
  expect(highlight("foo", [], githubDark).textContent).toMatchSnapshot();
});
