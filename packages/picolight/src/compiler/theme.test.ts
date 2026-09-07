import { parse } from "valibot";
import { describe, expect, it } from "vitest";
import { compileTheme, themeSchema } from "./theme.ts";

const colors = { "editor.background": "#000", "editor.foreground": "#fff" };

describe("color", () => {
  it("uses editor colors", () => {
    expect(compileTheme({ colors, tokenColors: [] })).toEqual({
      back: "#000",
      fore: "#fff",
      tokens: {},
    });
  });

  it("falls back to generic colors", () => {
    expect(
      compileTheme({
        colors: { background: "#000", foreground: "#fff" },
        tokenColors: [],
      }),
    ).toEqual({ back: "#000", fore: "#fff", tokens: {} });
  });

  it("prefers editor colors to generic colors", () => {
    expect(
      compileTheme({
        colors: { ...colors, background: "#111", foreground: "#eee" },
        tokenColors: [],
      }),
    ).toEqual({ back: "#000", fore: "#fff", tokens: {} });
  });

  it("prefers scope-less colors to editor colors", () => {
    expect(
      compileTheme({
        colors,
        tokenColors: [{ settings: { background: "#111", foreground: "#eee" } }],
      }),
    ).toEqual({ back: "#111", fore: "#eee", tokens: {} });
  });

  it("uses editor colors for a scope-less token color without colors", () => {
    expect(
      compileTheme({
        colors,
        tokenColors: [{ settings: { fontStyle: ["bold"] } }],
      }),
    ).toEqual({ back: "#000", fore: "#fff", tokens: {} });
  });

  it("throws on a missing foreground color", () => {
    expect(() =>
      compileTheme({
        colors: { "editor.background": "#000" },
        tokenColors: [],
      }),
    ).toThrow("Default color missing");
  });

  it("throws on a missing background color", () => {
    expect(() =>
      compileTheme({
        colors: { "editor.foreground": "#fff" },
        tokenColors: [],
      }),
    ).toThrow("Default color missing");
  });
});

describe("token", () => {
  it("compiles a scope", () => {
    expect(
      compileTheme({
        colors,
        tokenColors: [{ scope: ["keyword"], settings: { foreground: "#f00" } }],
      }).tokens,
    ).toEqual({ keyword: [null, "#f00"] });
  });

  it("compiles scopes", () => {
    expect(
      compileTheme({
        colors,
        tokenColors: [
          { scope: ["keyword", "string"], settings: { foreground: "#f00" } },
        ],
      }).tokens,
    ).toEqual({ keyword: [null, "#f00"], string: [null, "#f00"] });
  });

  it("prefers a later scope", () => {
    expect(
      compileTheme({
        colors,
        tokenColors: [
          { scope: ["keyword"], settings: { foreground: "#f00" } },
          { scope: ["keyword"], settings: { foreground: "#0f0" } },
        ],
      }).tokens,
    ).toEqual({ keyword: [null, "#0f0"] });
  });

  it("skips a scope without a foreground color", () => {
    expect(
      compileTheme({
        colors,
        tokenColors: [
          { scope: ["keyword"], settings: { fontStyle: ["bold"] } },
        ],
      }).tokens,
    ).toEqual({});
  });

  it("skips a scope without settings", () => {
    expect(
      compileTheme({ colors, tokenColors: [{ scope: ["keyword"] }] }).tokens,
    ).toEqual({});
  });

  it("skips scope selectors", () => {
    expect(
      compileTheme({
        colors,
        tokenColors: [
          {
            scope: ["keyword.control", "source keyword", "keyword*"],
            settings: { foreground: "#f00" },
          },
        ],
      }).tokens,
    ).toEqual({});
  });
});

describe("schema", () => {
  it("parses a scope", () => {
    expect(
      parse(themeSchema, { colors: {}, tokenColors: [{ scope: "keyword" }] })
        .tokenColors[0]?.scope,
    ).toEqual(["keyword"]);
  });

  it("parses scopes", () => {
    expect(
      parse(themeSchema, {
        colors: {},
        tokenColors: [{ scope: ["keyword", "string"] }],
      }).tokenColors[0]?.scope,
    ).toEqual(["keyword", "string"]);
  });

  it("keeps a missing scope undefined", () => {
    expect(
      parse(themeSchema, { colors: {}, tokenColors: [{}] }).tokenColors[0]
        ?.scope,
    ).toBeUndefined();
  });

  it("parses font styles", () => {
    expect(
      parse(themeSchema, {
        colors: {},
        tokenColors: [{ settings: { fontStyle: "bold italic" } }],
      }).tokenColors[0]?.settings?.fontStyle,
    ).toEqual(["bold", "italic"]);
  });

  it("rejects an unknown font style", () => {
    expect(() =>
      parse(themeSchema, {
        colors: {},
        tokenColors: [{ settings: { fontStyle: "foo" } }],
      }),
    ).toThrow();
  });
});
