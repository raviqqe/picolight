import { writeFile } from "node:fs/promises";
import { grammars } from "tm-grammars";
import { array, object, parse, record, string, union } from "valibot";
import type { Language, Lexer } from "../language.js";

const captureListSchema = record(string(), object({ name: string() }));

const patternSchema = union([
  object({
    include: string(),
  }),
  object({
    match: string(),
    name: string(),
  }),
]);

const grammarSchema = object({
  name: string(),
  patterns: array(patternSchema),
  repository: record(
    string(),
    object({
      begin: string(),
      beginCaptures: captureListSchema,
      end: string(),
      endCaptures: captureListSchema,
      name: string(),
      patterns: array(patternSchema),
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
  const patterns = grammar.patterns.flatMap((pattern) =>
    "include" in pattern ? [pattern.include.replace(/^#/, "")] : [],
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
