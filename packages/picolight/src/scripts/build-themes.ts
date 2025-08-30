import { writeFile } from "node:fs/promises";
import { omit } from "es-toolkit";
import { themes } from "tm-themes";
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

const compileTheme = async (name: string): Promise<Theme> => {
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

  const defaultColor =
    tokens[""]?.[1] ?? colors["editor.foreground"] ?? colors.foreground ?? "";

  if (!defaultColor) {
    throw new Error(`No default color for ${name}`);
  }

  return [tokens[""]?.[1] ?? colors.foreground ?? "", omit(tokens, [""])];
};

await Promise.all(
  themes.map(async ({ name }) => {
    const camelName = name.replace(
      /-./g,
      (match) => match?.[1]?.toUpperCase() ?? "",
    );

    const compiledTheme = await compileTheme(name);

    await writeFile(
      `src/themes/${name}.ts`,
      [
        `import type { Theme } from "../theme.js";`,
        `export const ${camelName}: Theme = ${JSON.stringify(compiledTheme)}`,
      ].join("\n"),
    );
  }),
);
