import type { Token } from "./token.js";

export type Theme = [color: string, Record<Token, [tag: Tag, color: string]>];

export type Tag = "b" | "em" | null;
