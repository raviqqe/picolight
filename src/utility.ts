const extractIndex = (match: RegExpExecArray | null): number =>
  match ? match.index : 0;

export const string = (text: string): number =>
  extractIndex(/"[^"]*"/.exec(text));

export const blank = (text: string): number =>
  extractIndex(/( \t\r\n)*/.exec(text));
