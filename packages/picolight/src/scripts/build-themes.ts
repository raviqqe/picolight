import { writeFile } from "node:fs/promises";
import { themes } from "tm-themes";

await Promise.all(
  themes.map(async ({ name }) => {
    const camelName = name.replace(
      /-./g,
      (match) => match?.[1]?.toUpperCase() ?? "",
    );
    const compiledTheme = Object.fromEntries(theme.map((theme) => foo));

    await writeFile(
      `src/themes/${name}.ts`,
      `export const ${camelName} = ${JSON.stringify(compiledTheme)}`,
    );
  }),
);
