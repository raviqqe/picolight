import { writeFile } from "node:fs/promises";
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

const compileTheme = async (name: string) =>
  parse(
    themeSchema,
    (
      await import(`tm-themes/themes/${name}.json`, {
        with: { type: "json" },
      })
    ).default,
  ).tokenColors.flatMap(
    ({ scope, settings }): [string, string][] =>
      scope?.flatMap((scope): [string, string][] =>
        !scope.includes(".") && settings?.foreground
          ? [[scope, settings.foreground]]
          : [],
      ) ?? [["", settings?.foreground ?? ""]],
  );

await Promise.all(
  themes.map(async ({ name }) => {
    const camelName = name.replace(
      /-./g,
      (match) => match?.[1]?.toUpperCase() ?? "",
    );

    const compiledTheme = compileTheme(name);

    await writeFile(
      `src/themes/${name}.ts`,
      [
        `import type { Theme } from "../theme.js";`,
        `export const ${camelName}: Theme = ${JSON.stringify(compiledTheme)}`,
      ].join("\n"),
    );
  }),
);
