import { omit } from "es-toolkit";
import {
  array,
  type InferOutput,
  literal,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
} from "valibot";
import type { Tag, Theme } from "../theme.ts";

const filteredCharacters = [" ", ".", "*"];

export const themeSchema = object({
  colors: object({
    background: optional(string()),
    "editor.background": optional(string()),
    "editor.foreground": optional(string()),
    foreground: optional(string()),
  }),
  tokenColors: array(
    object({
      scope: pipe(
        optional(union([string(), array(string())])),
        transform((value) =>
          typeof value === "string" ? [value] : (value ?? []),
        ),
      ),
      settings: optional(
        object({
          fontStyle: optional(
            pipe(
              string(),
              transform((value) => value.split(" ").filter(Boolean)),
              array(
                union([
                  literal("bold"),
                  literal("italic"),
                  literal("normal"),
                  literal("regular"),
                  literal("strikethrough"),
                  literal("underline"),
                ]),
              ),
            ),
          ),
          foreground: optional(string()),
        }),
      ),
    }),
  ),
});

type TextMateTheme = InferOutput<typeof themeSchema>;

export const compileTheme = ({ colors, tokenColors }: TextMateTheme): Theme => {
  const tokens = Object.fromEntries(
    tokenColors.flatMap(
      ({ scope, settings }) =>
        scope?.flatMap((scope): [string, [Tag, string]][] =>
          !filteredCharacters.some((character) => scope.includes(character)) &&
          settings?.foreground
            ? [[scope, [null, settings.foreground]]]
            : [],
        ) ?? [["", [null, settings?.foreground ?? ""]]],
    ),
  );

  const foregroundColor =
    tokens[""]?.[1] ?? colors["editor.foreground"] ?? colors.foreground;
  const backgroundColor =
    tokens[""]?.[1] ?? colors["editor.background"] ?? colors.background;

  if (!foregroundColor || !backgroundColor) {
    throw new Error("Default color missing", {
      cause: {
        backgroundColor,
        foregroundColor,
      },
    });
  }

  return {
    back: backgroundColor,
    fore: foregroundColor,
    tokens: omit(tokens, [""]),
  };
};
