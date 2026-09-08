import { describe, expect, it } from "vitest";
import { lex } from "../highlight.js";
import { typescript } from "./typescript.js";

describe("number", () => {
  it("matches a number", () => {
    expect(lex("42", typescript, 0)).toEqual([[["number", "constant"], "42"]]);
  });
});

describe("keyword", () => {
  it("matches an import keyword", () => {
    expect(lex('import { x } from "y";', typescript, 0)).toEqual([
      [["keyword"], "import"],
    ]);
  });

  it("matches a type operator", () => {
    expect(lex("keyof T", typescript, 0)).toEqual([[["keyword"], "keyof"]]);
  });

  it("matches a type predicate", () => {
    expect(lex("x is Foo", typescript, 2)).toEqual([[["keyword"], "is"]]);
  });

  it("matches a type annotation colon", () => {
    expect(lex(":", typescript, 0)).toEqual([[["keyword"], ":"]]);
  });
});

describe("storage", () => {
  it("matches a constant declaration", () => {
    expect(lex("const x = 1;", typescript, 0)).toEqual([
      [["storage"], "const"],
    ]);
  });

  it("matches a function declaration", () => {
    expect(lex("function foo() {}", typescript, 0)).toEqual([
      [["storage"], "function"],
    ]);
  });

  it("matches an interface keyword", () => {
    expect(lex("interface Foo {}", typescript, 0)).toEqual([
      [["storage"], "interface"],
    ]);
  });

  it("matches a type keyword before a name", () => {
    expect(lex("type Foo = string;", typescript, 0)).toEqual([
      [["storage"], "type"],
    ]);
  });

  it("does not match a type property key", () => {
    expect(lex("type: 1", typescript, 0)).toEqual([[[], "type"]]);
  });

  it("matches a modifier", () => {
    expect(lex("readonly x: number;", typescript, 0)).toEqual([
      [["storage"], "readonly"],
    ]);
  });
});

describe("support", () => {
  it("matches a primitive type", () => {
    expect(lex("number", typescript, 0)).toEqual([[["support"], "number"]]);
  });

  it("matches a function call of a primitive name", () => {
    expect(lex("string()", typescript, 0)).toEqual([[["entity"], "string"]]);
  });

  it("matches a module object", () => {
    expect(lex("module.exports", typescript, 0)).toEqual([
      [["support"], "module"],
    ]);
  });
});

describe("entity", () => {
  it("matches a function declaration name", () => {
    expect(lex("function foo() {}", typescript, 9)).toEqual([
      [["entity"], "foo"],
    ]);
  });

  it("matches a generic type name", () => {
    expect(lex("Promise<string>", typescript, 0)).toEqual([
      [["entity"], "Promise"],
    ]);
  });
});

describe("punctuation", () => {
  it("matches an opening type parameter bracket", () => {
    expect(lex("Foo<Bar>", typescript, 3)).toEqual([[["punctuation"], "<"]]);
  });

  it("matches a closing type parameter bracket", () => {
    expect(lex("Foo<Bar>", typescript, 7)).toEqual([[["punctuation"], ">"]]);
  });

  it("matches nested closing type parameter brackets", () => {
    expect(lex("Map<K, Set<V>>", typescript, 12)).toEqual([
      [["punctuation"], ">>"],
    ]);
  });

  it("does not match a comparison operator", () => {
    expect(lex("x > y", typescript, 2)).toEqual([[["keyword"], ">"]]);
  });
});
