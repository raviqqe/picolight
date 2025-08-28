import { expect, it } from "vitest";
import { highlight } from "./index.js";
import { picoDark } from "./themes/pico-dark.js";

it("highlights code", () => {
  expect(highlight("foo", [], picoDark).textContent).toMatchSnapshot();
});
