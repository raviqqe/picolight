const result = (match: RegExpExecArray | null): number | null =>
  match?.index ?? null;

export const string = (text: string): number | null =>
  result(/"[^"]*"/.exec(text));

export const blank = (text: string): number | null =>
  result(/( \t\r\n)*/.exec(text));

export const punctuation = (text: string): number | null =>
  result(/[\[\](){}]/.exec(text));
