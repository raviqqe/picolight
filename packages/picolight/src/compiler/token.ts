import { type Token, tokens } from "../token.ts";

const tokenSet = new Set<string>(tokens);

export const isToken = (name: string): name is Token => tokenSet.has(name);
