  export const keyword = (keywords:string[]) => new RegExp(`^${keywords.join("|")}`);

export const number = /^[+-]?[0-9.]+/;

export const string = /^"[^"]*"/;

export const parenthesis = /^[[\](){}]/;
