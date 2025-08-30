import type { Token } from "./token.js";

export type Theme = [
  backgroundColor: string,
  foregroundColor: string,
  tokens: Partial<Record<Token, [tag: Tag, color: string]>>,
];

export type Tag = "b" | "em" | null;
