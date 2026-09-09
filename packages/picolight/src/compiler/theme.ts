import {
  array,
  type InferOutput,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
} from "valibot";
import type { Theme } from "../theme.ts";
import type { Token } from "../token.ts";
import { isToken } from "./token.ts";

export const themeSchema = object({
  colors: object({
    background: optional(string()),
    "editor.background": optional(string()),
    "editor.foreground": optional(string()),
    foreground: optional(string()),
  }),
  tokenColors: array(
    object({
      scope: optional(
        pipe(
          union([string(), array(string())]),
          transform((value) => (typeof value === "string" ? [value] : value)),
        ),
      ),
      settings: optional(
        object({
          background: optional(string()),
          foreground: optional(string()),
        }),
      ),
    }),
  ),
});

type TextmateTheme = InferOutput<typeof themeSchema>;

export const compileTheme = ({ colors, tokenColors }: TextmateTheme): Theme => {
  const defaults = tokenColors.find(({ scope }) => !scope)?.settings;
  const foregroundColor =
    defaults?.foreground ?? colors["editor.foreground"] ?? colors.foreground;
  const backgroundColor =
    defaults?.background ?? colors["editor.background"] ?? colors.background;

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
    tokens: Object.fromEntries(
      tokenColors.flatMap(({ scope, settings }) =>
        (scope ?? []).flatMap((scope): [Token, string][] =>
          isToken(scope) && settings?.foreground
            ? [[scope, settings.foreground]]
            : [],
        ),
      ),
    ),
  };
};
