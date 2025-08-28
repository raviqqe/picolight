import type { Theme } from "../theme.js";
import { number, punctuation, string } from "../token.js";

export const picoDark: Theme = [
  "white",
  {
    [number]: [null, "lightyellow"],
    [punctuation]: [null, "gainsboro"],
    [string]: [null, "lightskyblue"],
    "": [null, "white"],
  },
];
