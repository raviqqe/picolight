import type { Token } from "./token.js";

export type Theme = {
  back: string;
  fore: string;
  tokens: Partial<Record<Token, [tag: Tag, color: string]>>;
};

export type Tag = "b" | "em" | null;
