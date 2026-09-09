import type { Token } from "./token.js";

export type Theme = {
  back: string;
  fore: string;
  tokens: Partial<Record<Token, string>>;
};
