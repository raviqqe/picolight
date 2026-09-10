import { describe, expect, it } from "vitest";
import { lex } from "../highlight.ts";
import { compileGrammar } from "./language.ts";

describe("match", () => {
  it("compiles a pattern", () => {
    const lexers = compileGrammar({
      patterns: [{ match: "foo", name: "keyword.control" }],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("matches at a given position", () => {
    const lexers = compileGrammar({
      patterns: [{ match: "foo", name: "keyword.control" }],
    });

    expect(lex("x foo", lexers, 2)).toEqual([[["keyword"], "foo"]]);
  });

  it("matches with a lookbehind", () => {
    const lexers = compileGrammar({
      patterns: [{ match: "(?<=\\()foo", name: "keyword.control" }],
    });

    expect(lex("(foo", lexers, 1)).toEqual([[["keyword"], "foo"]]);
    expect(() => lex("foo", lexers, 0)).toThrow("No match");
  });

  it("splits a match by a capture", () => {
    const lexers = compileGrammar({
      patterns: [
        { captures: { 1: { name: "keyword.control" } }, match: "(foo)bar" },
      ],
    });

    expect(lex("foobar", lexers, 0)).toEqual([
      [["keyword"], "foo"],
      [[], "bar"],
    ]);
  });

  it("splits a match by captures", () => {
    const lexers = compileGrammar({
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

    expect(lex("foobar", lexers, 0)).toEqual([
      [["keyword"], "foo"],
      [["string"], "bar"],
    ]);
  });

  it("uses a capture token of a whole match", () => {
    const lexers = compileGrammar({
      patterns: [
        { captures: { 0: { name: "keyword.control" } }, match: "foo" },
      ],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("uses a capture token in an array", () => {
    const lexers = compileGrammar({
      patterns: [{ captures: [{ name: "keyword.control" }], match: "foo" }],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("uses a capture token in a scope array", () => {
    const lexers = compileGrammar({
      patterns: [
        { captures: { 0: [{ name: "keyword.control" }] }, match: "foo" },
      ],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("layers nested captures inner first", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          captures: {
            1: { name: "string.quoted" },
            2: { name: "keyword.control" },
          },
          match: "((foo)bar)",
        },
      ],
    });

    expect(lex("foobar", lexers, 0)).toEqual([
      [["keyword", "string"], "foo"],
      [["string"], "bar"],
    ]);
  });

  it("numbers captures without hidden groups", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          captures: {
            1: { name: "keyword.control" },
            2: { name: "string.quoted" },
          },
          match: "(a*+)(b)",
        },
      ],
    });

    expect(lex("aab", lexers, 0)).toEqual([
      [["keyword"], "aa"],
      [["string"], "b"],
    ]);
  });

  it("prefers a name to capture tokens", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          captures: { 1: { name: "keyword.control" } },
          match: "(foo)bar",
          name: "string.quoted",
        },
      ],
    });

    expect(lex("foobar", lexers, 0)).toEqual([[["string"], "foobar"]]);
  });

  it("uses tokens of scopes inner first", () => {
    const lexers = compileGrammar({
      patterns: [{ match: "foo", name: "string.quoted keyword.control" }],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword", "string"], "foo"]]);
  });

  it("ignores meta scopes", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          captures: { 1: { name: "meta.name" } },
          match: "(foo)bar",
          name: "meta.expression entity.name",
        },
      ],
    });

    expect(lex("foobar", lexers, 0)).toEqual([[["entity"], "foobar"]]);
  });

  it("ignores unknown scopes", () => {
    const lexers = compileGrammar({
      patterns: [{ match: "foo", name: "foo.bar keyword.control" }],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("ignores a capture of unknown scopes", () => {
    expect(
      compileGrammar({
        patterns: [{ captures: { 1: { name: "foo.bar" } }, match: "(foo)bar" }],
      }),
    ).toEqual([[/(foo)bar/vy, []]]);
  });

  it("adds an indices flag only for captures", () => {
    expect(
      compileGrammar({
        patterns: [
          { match: "foo", name: "keyword.control" },
          { captures: { 1: { name: "keyword.control" } }, match: "(foo)" },
        ],
      }),
    ).toEqual([
      [/foo/vy, ["keyword"]],
      [/(foo)/dvy, [], { 1: ["keyword"] }],
    ]);
  });

  it("skips an invalid pattern", () => {
    const lexers = compileGrammar({
      patterns: [{ match: "(foo", name: "keyword.control" }],
    });

    expect(lexers).toEqual([]);
  });
});

describe("include", () => {
  it("resolves a rule", () => {
    const lexers = compileGrammar({
      patterns: [{ include: "#foo" }],
      repository: { foo: { match: "foo", name: "keyword.control" } },
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("resolves a rule of patterns", () => {
    const lexers = compileGrammar({
      patterns: [{ include: "#foo" }],
      repository: { foo: [{ match: "foo", name: "keyword.control" }] },
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("resolves a rule once", () => {
    const lexers = compileGrammar({
      patterns: [{ include: "#foo" }, { include: "#foo" }],
      repository: { foo: { match: "foo", name: "keyword.control" } },
    });

    expect(lexers).toHaveLength(1);
  });

  it("resolves a recursive rule", () => {
    const lexers = compileGrammar({
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
    const lexers = compileGrammar({ patterns: [{ include: "$self" }] });

    expect(lexers).toEqual([]);
  });
});

describe("region", () => {
  const string = { begin: '"', end: '"', name: "string.quoted" };
  const lexers = compileGrammar({ patterns: [string] });

  it("matches a region", () => {
    expect(lex('"foo" bar', lexers, 0)).toEqual([[["string"], '"foo"']]);
  });

  it("matches a multi-line region", () => {
    const source = '"foo\nbar"';

    expect(lex(source, lexers, 0)).toEqual([[["string"], source]]);
  });

  it("matches a region to the end of text", () => {
    expect(lex('"foo', lexers, 0)).toEqual([[["string"], '"foo']]);
  });

  it("consumes nested patterns", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          ...string,
          patterns: [{ match: "\\\\.", name: "constant.character.escape" }],
        },
      ],
    });
    const source = '"foo\\"bar"';

    expect(lex(source, lexers, 0)).toEqual([[["string"], source]]);
  });

  it("consumes nested patterns in a repository", () => {
    const lexers = compileGrammar({
      patterns: [{ ...string, patterns: [{ include: "#escape" }] }],
      repository: { escape: { match: "\\\\." } },
    });
    const source = '"foo\\"bar"';

    expect(lex(source, lexers, 0)).toEqual([[["string"], source]]);
  });

  it("keeps nested patterns from consuming the end", () => {
    const lexers = compileGrammar({
      patterns: [{ ...string, patterns: [{ match: "\\\\." }] }],
    });

    expect(lex('"foo\\" bar', lexers, 0)).toEqual([
      [["string"], '"foo\\" bar'],
    ]);
  });

  it("embeds only escapes of nested patterns", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          begin: "//",
          end: "(?<=\\n)",
          name: "comment.line",
          patterns: [{ match: "\\s+" }],
        },
      ],
    });

    expect(lex("// foo\n\nbar", lexers, 0)).toEqual([
      [["comment"], "// foo\n"],
    ]);
  });

  it("matches an end referring to the begin", () => {
    const lexers = compileGrammar({
      patterns: [{ begin: "([\"'])", end: "\\1", name: "string.quoted" }],
    });

    expect(lex("'foo\"bar' baz", lexers, 0)).toEqual([
      [["string"], "'foo\"bar'"],
    ]);
  });

  it("names a region by its content name", () => {
    const lexers = compileGrammar({
      patterns: [{ begin: "//", contentName: "comment.line", end: "(?=$)" }],
    });

    expect(lex("// foo\nbar", lexers, 0)).toEqual([[["comment"], "// foo"]]);
  });

  it("splits a structural region", () => {
    const lexers = compileGrammar({
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

    expect(lex(source, lexers, 0)).toEqual([[["punctuation"], "("]]);
    expect(lex(source, lexers, 1)).toEqual([[["keyword"], "foo"]]);
    expect(lex(source, lexers, 4)).toEqual([[["punctuation"], ")"]]);
  });

  it("splits a region without a name", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          begin: "\\(",
          captures: { 0: { name: "punctuation.parenthesis" } },
          end: "\\)",
        },
      ],
    });
    const source = "()";

    expect(lex(source, lexers, 0)).toEqual([[["punctuation"], "("]]);
    expect(lex(source, lexers, 1)).toEqual([[["punctuation"], ")"]]);
  });

  it("splits a delimiter by captures", () => {
    const lexers = compileGrammar({
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

    expect(lex("foobar", lexers, 0)).toEqual([
      [["keyword"], "foo"],
      [["string"], "bar"],
    ]);
    expect(lex("baz", lexers, 0)).toEqual([[["punctuation"], "baz"]]);
  });

  it("prefers outer patterns to nested ones", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          begin: "\\(",
          end: "\\)",
          name: "meta.expression",
          patterns: [{ match: "foo", name: "string.quoted" }],
        },
        { match: "foo", name: "keyword.control" },
      ],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
  });

  it("prefers nested patterns to general outer ones", () => {
    const lexers = compileGrammar({
      patterns: [
        { match: "[a-z]+", name: "variable.other" },
        {
          begin: "\\(",
          end: "\\)",
          name: "meta.expression",
          patterns: [{ match: "foo", name: "keyword.control" }],
        },
      ],
    });

    expect(lex("foo", lexers, 0)).toEqual([[["keyword"], "foo"]]);
    expect(lex("bar", lexers, 0)).toEqual([[["variable"], "bar"]]);
  });

  it("drops general patterns in nested contexts", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          begin: "\\(",
          end: "\\)",
          name: "meta.expression",
          patterns: [{ match: "[^)]+", name: "string.unquoted" }],
        },
      ],
    });

    expect(() => lex("(foo)", lexers, 1)).toThrow("No match");
  });

  it("drops patterns of arbitrary characters in nested contexts", () => {
    const lexers = compileGrammar({
      patterns: [
        {
          begin: "\\(",
          end: "\\)",
          name: "meta.expression",
          patterns: [{ match: "[^\\w\\s)]+", name: "invalid.illegal" }],
        },
      ],
    });

    expect(() => lex("(!)", lexers, 1)).toThrow("No match");
  });

  it("falls back to delimiters on an invalid end", () => {
    const lexers = compileGrammar({
      patterns: [{ ...string, end: "(" }],
    });

    expect(lex('"foo"', lexers, 0)).toEqual([[["string"], '"']]);
  });
});
