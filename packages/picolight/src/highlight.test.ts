import { describe, expect, it } from "vitest";
import { highlight, lex } from "./highlight.js";
import { githubDark } from "./themes/github-dark.js";

describe(lex, () => {
  it("matches a pattern", () => {
    expect(lex("foo", [[/foo/y, ["keyword"]]], 0)).toEqual([
      [["keyword"], "foo"],
    ]);
  });

  it("matches a first pattern", () => {
    expect(
      lex(
        "foo",
        [
          [/foo/y, ["keyword"]],
          [/foo/y, ["string"]],
        ],
        0,
      ),
    ).toEqual([[["keyword"], "foo"]]);
  });

  it("skips an empty match", () => {
    expect(
      lex(
        "foo",
        [
          [/x*/y, ["string"]],
          [/foo/y, ["keyword"]],
        ],
        0,
      ),
    ).toEqual([[["keyword"], "foo"]]);
  });

  it("throws on no match", () => {
    expect(() => lex("foo", [[/bar/y, []]], 0)).toThrow("No match");
  });

  it("splits a match by captures", () => {
    expect(
      lex(
        "foobar",
        [[/(foo)(bar)/dy, [], { 1: ["keyword"], 2: ["string"] }]],
        0,
      ),
    ).toEqual([
      [["keyword"], "foo"],
      [["string"], "bar"],
    ]);
  });

  it("layers capture tokens over match tokens", () => {
    expect(
      lex("afoob", [[/a(foo)b/dy, ["string"], { 1: ["keyword"] }]], 0),
    ).toEqual([
      [["string"], "a"],
      [["keyword", "string"], "foo"],
      [["string"], "b"],
    ]);
  });

  it("layers nested captures inner first", () => {
    expect(
      lex(
        "foobar",
        [[/((foo)bar)/dy, [], { 1: ["string"], 2: ["keyword"] }]],
        0,
      ),
    ).toEqual([
      [["keyword", "string"], "foo"],
      [["string"], "bar"],
    ]);
  });

  it("ignores an unmatched capture", () => {
    expect(
      lex("bar", [[/(foo)?(bar)/dy, [], { 1: ["keyword"], 2: ["string"] }]], 0),
    ).toEqual([[["string"], "bar"]]);
  });

  it("ignores an empty capture", () => {
    expect(
      lex(
        "foobar",
        [
          [
            /(foo)()(bar)/dy,
            [],
            { 1: ["keyword"], 2: ["constant"], 3: ["string"] },
          ],
        ],
        0,
      ),
    ).toEqual([
      [["keyword"], "foo"],
      [["string"], "bar"],
    ]);
  });

  it("ignores captures outside a match", () => {
    expect(
      lex(
        "foobarbaz",
        [
          [
            /(?<=(foo))(bar)(?=(baz))/dy,
            [],
            { 1: ["keyword"], 2: ["string"], 3: ["constant"] },
          ],
        ],
        3,
      ),
    ).toEqual([[["string"], "bar"]]);
  });

  it("ignores captures of a pattern without indices", () => {
    expect(lex("foo", [[/(foo)/y, [], { 1: ["keyword"] }]], 0)).toEqual([
      [[], "foo"],
    ]);
  });
});

describe(highlight, () => {
  it("highlights captures", () => {
    expect(
      highlight(
        "foobar",
        { lexers: [[/(foo)(bar)/dy, [], { 1: ["keyword"], 2: ["string"] }]] },
        githubDark,
      ).outerHTML,
    ).toMatchSnapshot();
  });
});
