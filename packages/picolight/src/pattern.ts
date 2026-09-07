export const keyword = (keywords: string[], terminal: string) =>
  new RegExp(
    `(${keywords.map((RegExp as unknown as { escape: (text: string) => string }).escape).join("|")})(?!${terminal})`,
    "y",
  );

export const number = /[+-]?[0-9.]+(e[0-9]+)?/iy;

export const string = /"([^\\"]|\\[nrt\\"])*("|$)/y;

export const parenthesis = /[[\](){}]/y;

export const identifier = (head: string, tail: string) =>
  new RegExp(`${head}${tail}*`, "y");

export const surround = (start: RegExp, middle: RegExp, end: RegExp): RegExp =>
  new RegExp(`${start.source}(${middle.source})*${end.source}`, "y");
