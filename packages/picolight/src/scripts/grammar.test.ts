import { describe, expect, it } from "vitest";
import { lex } from "../highlight.ts";
import { compileGrammar } from "./grammar.ts";

describe("match", () => {
  it("compiles a pattern", () => {
    const { lexers } = compileGrammar({
      patterns: [{ match: "foo", name: "keyword.control" }],
    });

    expect(lex("foo", lexers)).toEqual([["keyword"], "foo"]);
  });

  it("matches at a given position", () => {
    const { lexers } = compileGrammar({
      patterns: [{ match: "foo", name: "keyword.control" }],
    });

    expect(lex("x foo", lexers, 2)).toEqual([["keyword"], "foo"]);
  });

  it("matches with a lookbehind", () => {
    const { lexers } = compileGrammar({
      patterns: [{ match: "(?<=\\()foo", name: "keyword.control" }],
    });

    expect(lex("(foo", lexers, 1)).toEqual([["keyword"], "foo"]);
    expect(() => lex("foo", lexers)).toThrow("No match");
  });

  it("uses a capture token", () => {
    const { lexers } = compileGrammar({
      patterns: [
        { captures: { 1: { name: "keyword.control" } }, match: "(foo)bar" },
      ],
    });

    expect(lex("foobar", lexers)).toEqual([["keyword"], "foobar"]);
  });

  it("uses a capture token in an array", () => {
    const { lexers } = compileGrammar({
      patterns: [{ captures: [{ name: "keyword.control" }], match: "foo" }],
    });

    expect(lex("foo", lexers)).toEqual([["keyword"], "foo"]);
  });

  it("uses a capture token in a scope array", () => {
    const { lexers } = compileGrammar({
      patterns: [
        { captures: { 0: [{ name: "keyword.control" }] }, match: "foo" },
      ],
    });

    expect(lex("foo", lexers)).toEqual([["keyword"], "foo"]);
  });

  it("prefers a name to capture tokens", () => {
    const { lexers } = compileGrammar({
      patterns: [
        {
          captures: { 1: { name: "keyword.control" } },
          match: "(foo)bar",
          name: "string.quoted",
        },
      ],
    });

    expect(lex("foobar", lexers)).toEqual([["string"], "foobar"]);
  });

  it("skips a pattern whose captures need different tokens", () => {
    const { lexers } = compileGrammar({
      patterns: [
        {
          captures: {
            1: { name: "keyword.control" },
            2: { name: "string.quoted" },
          },
          match: "(foo)(bar)",
        },
      ],
    });

    expect(lexers).toEqual([]);
  });

  it("skips an invalid pattern", () => {
    const { lexers } = compileGrammar({
      patterns: [{ match: "(foo", name: "keyword.control" }],
    });

    expect(lexers).toEqual([]);
  });
});

describe("include", () => {
  it("resolves a rule", () => {
    const { lexers } = compileGrammar({
      patterns: [{ include: "#foo" }],
      repository: { foo: { match: "foo", name: "keyword.control" } },
    });

    expect(lex("foo", lexers)).toEqual([["keyword"], "foo"]);
  });

  it("resolves a rule of patterns", () => {
    const { lexers } = compileGrammar({
      patterns: [{ include: "#foo" }],
      repository: { foo: [{ match: "foo", name: "keyword.control" }] },
    });

    expect(lex("foo", lexers)).toEqual([["keyword"], "foo"]);
  });

  it("resolves a rule once", () => {
    const { lexers } = compileGrammar({
      patterns: [{ include: "#foo" }, { include: "#foo" }],
      repository: { foo: { match: "foo", name: "keyword.control" } },
    });

    expect(lexers).toHaveLength(1);
  });

  it("resolves a recursive rule", () => {
    const { lexers } = compileGrammar({
      patterns: [{ include: "#foo" }],
      repository: {
        foo: {
          patterns: [
            { include: "#foo" },
            { match: "foo", name: "keyword.control" },
          ],
        },
      },
    });

    expect(lexers).toHaveLength(1);
  });

  it("ignores an unknown rule", () => {
    const { lexers } = compileGrammar({ patterns: [{ include: "$self" }] });

    expect(lexers).toEqual([]);
  });
});

describe("region", () => {
  const string = { begin: '"', end: '"', name: "string.quoted" };
  const { lexers } = compileGrammar({ patterns: [string] });

  it("matches a region", () => {
    expect(lex('"foo" bar', lexers)).toEqual([["string"], '"foo"']);
  });

  it("matches a multi-line region", () => {
    const source = '"foo\nbar"';

    expect(lex(source, lexers)).toEqual([["string"], source]);
  });

  it("matches a region to the end of text", () => {
    expect(lex('"foo', lexers)).toEqual([["string"], '"foo']);
  });

  it("consumes nested patterns", () => {
    const { lexers } = compileGrammar({
      patterns: [
        {
          ...string,
          patterns: [{ match: "\\\\.", name: "constant.character.escape" }],
        },
      ],
    });
    const source = '"foo\\"bar"';

    expect(lex(source, lexers)).toEqual([["string"], source]);
  });

  it("consumes nested patterns in a repository", () => {
    const { lexers } = compileGrammar({
      patterns: [{ ...string, patterns: [{ include: "#escape" }] }],
      repository: { escape: { match: "\\\\." } },
    });
    const source = '"foo\\"bar"';

    expect(lex(source, lexers)).toEqual([["string"], source]);
  });

  it("keeps nested patterns from consuming the end", () => {
    const { lexers } = compileGrammar({
      patterns: [{ ...string, patterns: [{ match: "." }] }],
    });

    expect(lex('"foo" bar', lexers)).toEqual([["string"], '"foo"']);
  });

  it("splits a structural region", () => {
    const { lexers } = compileGrammar({
      patterns: [
        {
          begin: "\\(",
          beginCaptures: { 0: { name: "punctuation.begin" } },
          end: "\\)",
          endCaptures: { 0: { name: "punctuation.end" } },
          name: "meta.expression",
          patterns: [{ match: "foo", name: "keyword.control" }],
        },
      ],
    });
    const source = "(foo)";

    expect(lex(source, lexers)).toEqual([["punctuation"], "("]);
    expect(lex(source, lexers, 1)).toEqual([["keyword"], "foo"]);
    expect(lex(source, lexers, 4)).toEqual([["punctuation"], ")"]);
  });

  it("splits a region without a name", () => {
    const { lexers } = compileGrammar({
      patterns: [
        {
          begin: "\\(",
          captures: { 0: { name: "punctuation.parenthesis" } },
          end: "\\)",
        },
      ],
    });
    const source = "()";

    expect(lex(source, lexers)).toEqual([["punctuation"], "("]);
    expect(lex(source, lexers, 1)).toEqual([["punctuation"], ")"]);
  });

  it("skips a delimiter whose captures need different tokens", () => {
    const { lexers } = compileGrammar({
      patterns: [
        {
          begin: "(foo)(bar)",
          beginCaptures: {
            1: { name: "keyword.control" },
            2: { name: "string.quoted" },
          },
          end: "baz",
          endCaptures: { 0: { name: "punctuation.end" } },
          name: "meta.expression",
        },
      ],
    });

    expect(() => lex("foobar", lexers)).toThrow("No match");
    expect(lex("baz", lexers)).toEqual([["punctuation"], "baz"]);
  });

  it("falls back to delimiters on an invalid end", () => {
    const { lexers } = compileGrammar({
      patterns: [{ ...string, end: "(" }],
    });

    expect(lex('"foo"', lexers)).toEqual([["string"], '"']);
  });
});
