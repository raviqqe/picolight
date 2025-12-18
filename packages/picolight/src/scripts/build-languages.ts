import { writeFile } from "node:fs/promises";
import { omit } from "es-toolkit";
import { grammars } from "tm-grammars";
import { array, object, parse, string } from "valibot";
import type { Language } from "../language.js";

const filteredCharacters = [" ", ".", "*"];

const grammarSchema = object({
  name: string(),
  patterns: array(
    object({
      include: string(),
    }),
  ),
  repository: array(
    object({
      include: string(),
    }),
  ),
});

const compileLanguage = async (name: string): Promise<Language> => {
  const { patterns, repository } = parse(
    grammarSchema,
    (
      await import(`tm-grammars/grammars/${name}.json`, {
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
    lexers: omit(tokens, [""]),
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
