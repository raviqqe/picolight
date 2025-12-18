import { writeFile } from "node:fs/promises";
import { grammars } from "tm-grammars";
import { array, object, parse, string } from "valibot";
import type { Language, Lexer } from "../language.js";

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
  const grammar = parse(
    grammarSchema,
    (
      await import(`tm-grammars/grammars/${name}.json`, {
        with: { type: "json" },
      })
    ).default,
  );

  const lexers: Record<string, Lexer> = {};
  const patterns = grammar.patterns.map(({ include }) =>
    include.replace(/^#/, ""),
  );
  const visited = new Set<string>();
  let pattern: string | undefined;

  while ((pattern = patterns.pop())) {
    if (visited.has(pattern)) {
      continue;
    }

    visited.add(pattern);
  }

  return { lexers: Object.values(lexers) };
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
