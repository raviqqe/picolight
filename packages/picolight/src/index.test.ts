import { expect, it } from "vitest";
import { highlight } from "./index.js";
import { scheme } from "./languages/scheme.js";
import { picoDark } from "./themes/pico-dark.js";

it("highlights code", () => {
  expect(highlight("foo", scheme, picoDark).outerHTML).toMatchSnapshot();
});
