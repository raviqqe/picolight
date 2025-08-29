import { writeFile } from "node:fs/promises";
import { themes } from "tm-themes";
import { array, object, optional, parse, string } from "valibot";

const themeSchema = object({
  colors: object({
    tokenColors: array(
      object({
        scope: optional(array(string())),
        settings: object({
          foreground: optional(string()),
        }),
      }),
    ),
  }),
});

await Promise.all(
  themes.map(async ({ name }) => {
    const camelName = name.replace(
      /-./g,
      (match) => match?.[1]?.toUpperCase() ?? "",
    );
    const compiledTheme = parse(
      themeSchema,
      (
        await import(`tm-themes/themes/${name}.json`, {
          with: { type: "json" },
        })
      ).default,
    ).colors.tokenColors.flatMap(
      ({ scope, settings }): [string, string][] =>
        scope?.flatMap((scope): [string, string][] =>
          !scope.includes(".") && settings.foreground
            ? [[scope, settings.foreground]]
            : [],
        ) ?? [["", settings.foreground ?? ""]],
    );

    await writeFile(
      `src/themes/${name}.ts`,
      `export const ${camelName} = ${JSON.stringify(compiledTheme)}`,
    );
  }),
);
