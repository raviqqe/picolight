export const keyword = (keywords: string[], terminal: string) =>
  new RegExp(
    `^(${keywords.map((RegExp as unknown as { escape: (text: string) => string }).escape).join("|")})(?!${terminal})`,
  );

export const number = /^[+-]?[0-9.]+(e[0-9]+)?/i;

export const string = /^"([^\\"]|\\[nrt\\"])*("|$)/;

export const parenthesis = /^[[\](){}]/;

export const identifier = (head: string, tail: string) =>
  new RegExp(`^${head}${tail}*`);
