import { expect, it } from "vitest";
import { highlight } from "./index.js";
import { scheme } from "./languages/scheme.js";
import { githubDark } from "./themes/github-dark.js";

it("highlights code", () => {
  expect(highlight("foo", scheme, githubDark).outerHTML).toMatchSnapshot();
});
