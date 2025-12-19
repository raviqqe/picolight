import { log } from "node:console";
import { writeFile } from "node:fs/promises";
import { grammars } from "tm-grammars";
import {
  array,
  lazy,
  object,
  optional,
  parse,
  record,
  strictObject,
  string,
  union,
  unknown,
} from "zod";
import type { Language, Lexer } from "../language.js";

const captureMapSchema = record(
  string(),
  union([
    object({ name: string() }),
    object({ patterns: lazy(() => array(unknown())) }),
    strictObject({}),
  ]),
);

const patternSchema = union([
  object({
    include: string(),
  }),
  object({
    begin: string(),
    beginCaptures: optional(captureMapSchema),
    end: string(),
    endCaptures: optional(captureMapSchema),
    name: optional(string()),
    get patterns() {
      return optional(array(patternSchema));
    },
  }),
  object({
    captures: optional(captureMapSchema),
    match: string(),
    name: optional(string()),
  }),
  object({
    get patterns() {
      return array(patternSchema);
    },
  }),
  array(unknown()),
]);

const grammarSchema = object({
  name: string(),
  patterns: array(patternSchema),
  repository: optional(record(string(), patternSchema)),
});

const compileLanguage = async (name: string): Promise<Language> => {
  log(`Compiling ${name}`);

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

for (const { name } of grammars) {
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
}
