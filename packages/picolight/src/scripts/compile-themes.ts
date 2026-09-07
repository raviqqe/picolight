import { log } from "node:console";
import { writeFile } from "node:fs/promises";
import { camelCase } from "es-toolkit";
import { themes } from "tm-themes";
import { parse } from "valibot";
import { compileTheme, themeSchema } from "../compiler/theme.ts";

for (const { name } of themes) {
  log(`Compiling ${name}`);

  const theme = compileTheme(
    parse(
      themeSchema,
      (
        await import(`tm-themes/themes/${name}.json`, {
          with: { type: "json" },
        })
      ).default,
    ),
  );

  await writeFile(
    `src/themes/${name}.ts`,
    [
      `import type { Theme } from "../theme.js";`,
      `export const ${camelCase(name)}: Theme = ${JSON.stringify(theme)}`,
    ].join("\n"),
  );
}
