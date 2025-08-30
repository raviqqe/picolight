export const keyword = (keywords: string[]) =>
  new RegExp(
    `^(${keywords.map((RegExp as unknown as { escape: (text: string) => string }).escape).join("|")})`,
  );

export const number = /^[+-]?[0-9.]+/;

export const string = /^"([^\\"]|\\[nrt\\"])*"/;

export const parenthesis = /^[[\](){}]/;
