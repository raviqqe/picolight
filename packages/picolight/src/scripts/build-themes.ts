import { writeFile } from "node:fs/promises";
import { themes } from "tm-themes";

await Promise.all(
  themes.map(async ({ name }) => {
    const camelName = name.replace(
      /-./g,
      (match) => match?.[1]?.toUpperCase() ?? "",
    );
    const compiledTheme = (
      await import(`tm-themes/themes/${name}.json`, {
        with: { type: "json" },
      })
    ).tokenColors.flatMap(
      ({ scope, settings }): [string, string][] =>
        scope
          ?.map((scope) => [scope, settings.foreground])
          .filter(
            ([scope, color]: [string, string | undefined]) =>
              color && !scope.contains("."),
          ) ?? [["", settings.foreground]],
    );

    await writeFile(
      `src/themes/${name}.ts`,
      `export const ${camelName} = ${JSON.stringify(compiledTheme)}`,
    );
  }),
);
