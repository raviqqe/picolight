import { describe, expect, it } from "vitest";
import { number, string } from "./pattern.js";

describe("number", () => {
  it("matches an integer", () => {
    const text = "42";

    expect(text.match(number)?.[0]).toBe(text);
  });

  it("matches a positive sign", () => {
    const text = "+42";

    expect(text.match(number)?.[0]).toBe(text);
  });

  it("matches a negative sign", () => {
    const text = "+42";

    expect(text.match(number)?.[0]).toBe(text);
  });

  it("matches an exponent", () => {
    const text = "42e42";

    expect(text.match(number)?.[0]).toBe(text);
  });
});

describe("string", () => {
  it("matches a string", () => {
    const text = `"foo"`;

    expect(text.match(string)?.[0]).toBe(text);
  });

  it("matches a string to the end", () => {
    const text = `"foo`;

    expect(text.match(string)?.[0]).toBe(text);
  });

  it("matches a multi-line string to the end", () => {
    const text = '"foo\nbar';

    expect(text.match(string)?.[0]).toBe(text);
  });
});
