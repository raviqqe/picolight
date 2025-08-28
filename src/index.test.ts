import { expect, it } from "vitest";
import { highlight } from "./index.js";
import { picoDark } from "./themes/pico-dark.js";
import { scheme } from "./languages/scheme.js";

it("highlights code", () => {
  expect(highlight("foo", scheme, picoDark).outerHTML).toMatchSnapshot();
});
