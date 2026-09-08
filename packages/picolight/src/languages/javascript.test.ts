import { describe, expect, it } from "vitest";
import { lex } from "../highlight.js";
import { javascript } from "./javascript.js";

describe("comment", () => {
  it("matches a comment", () => {
    const source = "// foo\n";

    expect(lex(source, javascript, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a comment to the end", () => {
    const source = "// foo";

    expect(lex(source, javascript, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a block comment", () => {
    const source = "/* foo */";

    expect(lex(source, javascript, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a multi-line block comment", () => {
    const source = "/*\n * foo\n */";

    expect(lex(source, javascript, 0)).toEqual([[["comment"], source]]);
  });

  it("matches a block comment to the end", () => {
    const source = "/* foo";

    expect(lex(source, javascript, 0)).toEqual([[["comment"], source]]);
  });
});

describe("string", () => {
  it("matches a string", () => {
    const source = '"foo"';

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });

  it("matches a single-quoted string", () => {
    const source = "'foo'";

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });

  it("matches escapes", () => {
    const source = '"\\"\\n\\u0041"';

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });

  it("matches a string to the end of a line", () => {
    expect(lex('"foo\nbar', javascript, 0)).toEqual([[["string"], '"foo']]);
  });

  it("matches a template literal", () => {
    const source = "`foo`";

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });

  it("matches a multi-line template literal", () => {
    const source = "`foo\nbar`";

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });

  it("matches a template literal to the end", () => {
    const source = "`foo\nbar";

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });
});

describe("regular expression", () => {
  it("matches a regular expression", () => {
    const source = "/foo/";

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });

  it("matches flags", () => {
    expect(lex("/foo/gi", javascript, 0)).toEqual([
      [["string"], "/foo/"],
      [["keyword", "string"], "gi"],
    ]);
  });

  it("matches a slash in a character class", () => {
    const source = "/[/]/";

    expect(lex(source, javascript, 0)).toEqual([[["string"], source]]);
  });

  it("matches a regular expression after an operator", () => {
    expect(lex("x = /foo/", javascript, 4)).toEqual([[["string"], "/foo/"]]);
  });

  it("matches a regular expression after a keyword", () => {
    expect(lex("return /foo/", javascript, 7)).toEqual([[["string"], "/foo/"]]);
  });

  it("does not match a division", () => {
    expect(lex("x / y", javascript, 2)).toEqual([[["keyword"], "/"]]);
  });
});

describe("number", () => {
  for (const text of [
    "42",
    "4.2",
    ".42",
    "42.",
    "4e2",
    "4.2e-2",
    "0x2a",
    "0o52",
    "0b101",
    "1_000",
    "42n",
  ]) {
    it(`matches ${text}`, () => {
      expect(lex(text, javascript, 0)).toEqual([
        [["number", "constant"], text],
      ]);
    });
  }

  it("does not match a sign", () => {
    expect(lex("-42", javascript, 0)).toEqual([[["keyword"], "-"]]);
  });
});

describe("constant", () => {
  for (const text of [
    "true",
    "false",
    "null",
    "undefined",
    "NaN",
    "Infinity",
  ]) {
    it(`matches ${text}`, () => {
      expect(lex(text, javascript, 0)).toEqual([[["constant"], text]]);
    });
  }

  it("matches a constant declaration", () => {
    expect(lex("const foo = 1", javascript, 6)).toEqual([
      [["constant"], "foo"],
    ]);
  });

  it("does not match a prefix of an identifier", () => {
    expect(lex("nullable", javascript, 0)).toEqual([[[], "nullable"]]);
  });
});

describe("keyword", () => {
  it("matches a keyword", () => {
    expect(lex("if (x) {}", javascript, 0)).toEqual([[["keyword"], "if"]]);
  });

  it("matches an import keyword", () => {
    expect(lex('import { x } from "y";', javascript, 0)).toEqual([
      [["keyword"], "import"],
    ]);
  });

  it("matches a from keyword before a module name", () => {
    expect(lex('from "y";', javascript, 0)).toEqual([[["keyword"], "from"]]);
  });

  it("matches a from function call", () => {
    expect(lex("from(1)", javascript, 0)).toEqual([[["entity"], "from"]]);
  });

  it("matches an operator", () => {
    expect(lex("===", javascript, 0)).toEqual([[["keyword"], "==="]]);
  });

  it("matches a spread operator", () => {
    expect(lex("...xs", javascript, 0)).toEqual([[["keyword"], "..."]]);
  });
});

describe("storage", () => {
  it("matches a declaration keyword", () => {
    expect(lex("const x = 1;", javascript, 0)).toEqual([
      [["storage"], "const"],
    ]);
  });

  it("matches an accessor keyword", () => {
    expect(lex("get foo() {}", javascript, 0)).toEqual([[["storage"], "get"]]);
  });

  it("matches an accessor function call", () => {
    expect(lex("get(1)", javascript, 0)).toEqual([[["entity"], "get"]]);
  });

  it("matches an arrow", () => {
    expect(lex("=>", javascript, 0)).toEqual([[["storage"], "=>"]]);
  });
});

describe("variable", () => {
  it("matches this", () => {
    expect(lex("this.x", javascript, 0)).toEqual([[["variable"], "this"]]);
  });
});

describe("support", () => {
  it("matches a promise object", () => {
    expect(lex("Promise.all([])", javascript, 0)).toEqual([
      [["support"], "Promise"],
    ]);
  });

  it("matches a module object", () => {
    expect(lex("module.exports", javascript, 0)).toEqual([
      [["support"], "module"],
    ]);
  });

  it("matches a length property", () => {
    expect(lex("xs.length", javascript, 2)).toEqual([
      [["punctuation"], "."],
      [["support"], "length"],
    ]);
  });
});

describe("entity", () => {
  it("matches a class name", () => {
    expect(lex("class Foo {}", javascript, 6)).toEqual([[["entity"], "Foo"]]);
  });

  it("matches a super class name", () => {
    expect(lex("extends Foo {}", javascript, 8)).toEqual([[["entity"], "Foo"]]);
  });

  it("matches a constructor name", () => {
    expect(lex("new Foo()", javascript, 4)).toEqual([[["entity"], "Foo"]]);
  });

  it("matches a function call", () => {
    expect(lex("foo()", javascript, 0)).toEqual([[["entity"], "foo"]]);
  });

  it("matches a function declaration", () => {
    expect(lex("function foo() {}", javascript, 9)).toEqual([
      [["entity"], "foo"],
    ]);
  });

  it("matches an arrow function assignment", () => {
    expect(lex("foo = (x) => x", javascript, 0)).toEqual([[["entity"], "foo"]]);
  });

  it("matches a function expression assignment", () => {
    expect(lex("foo = function () {}", javascript, 0)).toEqual([
      [["entity"], "foo"],
    ]);
  });

  it("matches a method call", () => {
    expect(lex("foo.bar()", javascript, 3)).toEqual([
      [["punctuation"], "."],
      [["entity"], "bar"],
    ]);
  });

  it("matches a type name", () => {
    expect(lex("Foo", javascript, 0)).toEqual([[["entity"], "Foo"]]);
  });

  it("does not match an object name", () => {
    expect(lex("Foo.bar", javascript, 0)).toEqual([[[], "Foo"]]);
  });

  it("does not match a constant name", () => {
    expect(lex("FOO", javascript, 0)).toEqual([[[], "FOO"]]);
  });
});

describe("property", () => {
  it("matches a property", () => {
    expect(lex("foo.bar", javascript, 3)).toEqual([
      [["punctuation"], "."],
      [[], "bar"],
    ]);
  });

  it("matches an optional property", () => {
    expect(lex("foo?.bar", javascript, 3)).toEqual([
      [["punctuation"], "?."],
      [[], "bar"],
    ]);
  });

  it("does not match a keyword property", () => {
    expect(lex("foo.default", javascript, 3)).toEqual([
      [["punctuation"], "."],
      [[], "default"],
    ]);
  });
});

describe("identifier", () => {
  it("matches an identifier", () => {
    expect(lex("foo", javascript, 0)).toEqual([[[], "foo"]]);
  });

  it("matches a dollar sign", () => {
    expect(lex("$foo", javascript, 0)).toEqual([[[], "$foo"]]);
  });
});

describe("punctuation", () => {
  it("matches a parenthesis", () => {
    expect(lex("(", javascript, 0)).toEqual([[["punctuation"], "("]]);
  });

  it("matches a colon", () => {
    expect(lex(":", javascript, 0)).toEqual([[["punctuation"], ":"]]);
  });
});
