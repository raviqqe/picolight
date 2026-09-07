import { describe, expect, it } from "vitest";
import { lex } from "./highlight.js";
import { number, parenthesis, string } from "./pattern.js";

const match = (text: string, pattern: RegExp): string =>
  lex(text, [[pattern, []]])[1];

describe("number", () => {
  it("matches an integer", () => {
    const text = "42";

    expect(match(text, number)).toBe(text);
  });

  it("matches a positive sign", () => {
    const text = "+42";

    expect(match(text, number)).toBe(text);
  });

  it("matches a negative sign", () => {
    const text = "-42";

    expect(match(text, number)).toBe(text);
  });

  it("matches an exponent", () => {
    const text = "42e42";

    expect(match(text, number)).toBe(text);
  });
});

describe("string", () => {
  it("matches a string", () => {
    const text = `"foo"`;

    expect(match(text, string)).toBe(text);
  });

  it("matches escapes", () => {
    const text = `"\\n\\r\\t\\"\\\\"`;

    expect(match(text, string)).toBe(text);
  });

  it("matches a string to the end", () => {
    const text = `"foo`;

    expect(match(text, string)).toBe(text);
  });

  it("matches a multi-line string to the end", () => {
    const text = '"foo\nbar';

    expect(match(text, string)).toBe(text);
  });
});

describe("parenthesis", () => {
  for (const text of "(){}[]") {
    it(`matches ${text}`, () => {
      expect(match(text, parenthesis)).toBe(text);
    });
  }
});
