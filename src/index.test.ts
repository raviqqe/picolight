import { expect, it } from "vitest";
import { highlight } from "./index.js";

it("highlights code", () => {
  expect(highlight("foo", []).textContent).toMatchSnapshot();
});
