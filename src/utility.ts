export const string = (text: string):number=> /"[^"]*"/.match();

export const blank = (text: string): number=> /( \t\r\n)*/;
