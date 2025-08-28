import type { Theme } from "../theme.js";
import { number, string } from "../token.js";

export const picoDark: Theme = {
  [number]: [null, "lightyellow"],
  [string]: [null, "foo"],
};
