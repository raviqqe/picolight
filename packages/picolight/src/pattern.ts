export const keyword = (keywords: string[]) =>
  new RegExp(`^(${keywords.map(RegExp.escape).join("|")})`);

export const number = /^[+-]?[0-9.]+/;

export const string = /^"[^"]*"/;

export const parenthesis = /^[[\](){}]/;
