import { writeFile } from "node:fs/promises";
import { omit } from "es-toolkit";
import { grammars } from "tm-grammars";
import {
  array,
  literal,
  object,
  optional,
  parse,
  pipe,
  string,
  transform,
  union,
} from "valibot";
import type { Tag, Theme } from "../theme.js";

const filteredCharacters = [" ", ".", "*"];

const themeSchema = object({
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

const compileLanguage = async (name: string): Promise<Theme> => {
  const { colors, tokenColors } = parse(
    themeSchema,
    (
      await import(`tm-themes/themes/${name}.json`, {
        with: { type: "json" },
      })
    ).default,
  );

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
    throw new Error(`Default color missing for ${name}`, {
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

await Promise.all(
  grammars.map(async ({ name }) => {
    const camelName = name.replace(
      /-./g,
      (match) => match?.[1]?.toUpperCase() ?? "",
    );

    const language = await compileLanguage(name);

    await writeFile(
      `src/themes/${name}.ts`,
      [
        `import type { Language } from "../language.js";`,
        `export const ${camelName}: Theme = ${JSON.stringify(language)}`,
      ].join("\n"),
    );
  }),
);
