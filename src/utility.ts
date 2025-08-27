export const string = (_text: string): number => /"[^"]*"/.match();

export const blank = (_text: string): number => /( \t\r\n)*/;
