import { writeFile } from "node:fs/promises";
import { omit } from "es-toolkit";
import { themes } from "tm-themes";
import {
  array,
  object,
  optional,
  parse,
  pipe,
  string,
  transform,
  union,
} from "valibot";
import type { Tag, Theme } from "../theme.js";

const themeSchema = object({
  tokenColors: array(
    object({
      scope: pipe(
        optional(union([string(), array(string())])),
        transform((value) =>
          typeof value === "string" ? value.split(" ") : value,
        ),
      ),
      settings: optional(
        object({
          foreground: optional(string()),
        }),
      ),
    }),
  ),
});

const compileTheme = async (name: string): Promise<Theme> => {
  const theme = Object.fromEntries(
    parse(
      themeSchema,
      (
        await import(`tm-themes/themes/${name}.json`, {
          with: { type: "json" },
        })
      ).default,
    ).tokenColors.flatMap(
      ({ scope, settings }): [string, [Tag, string]][] =>
        scope?.flatMap((scope) =>
          !scope.includes(".") && settings?.foreground
            ? [[scope, [null, settings.foreground]]]
            : [],
        ) ?? [["", [null, settings?.foreground ?? ""]]],
    ),
  );

  return [theme[""]?.[1] ?? "", omit(theme, [""])];
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
