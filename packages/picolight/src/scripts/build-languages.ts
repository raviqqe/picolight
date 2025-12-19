import { log } from "node:console";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
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

const directory = "src/languages/experimental";

const captureMapSchema = record(
  string(),
  union([
    string(),
    strictObject({}),
    object({ name: string() }),
    object({ patterns: lazy(() => array(unknown())) }),
  ]),
);

const patternSchema = union([
  strictObject({}),
  object({
    include: string(),
  }),
  object({
    name: string(),
  }),
  object({
    packages: array(
      object({
        import: string(),
      }),
    ),
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
    begin: string(),
    beginCaptures: optional(captureMapSchema),
    while: string(),
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
  object({
    begin: string(),
    captures: captureMapSchema,
  }),
  object({
    begin: string(),
    captures: captureMapSchema,
    end: string(),
    name: string(),
    get patterns() {
      return array(patternSchema);
    },
  }),
]);

const grammarSchema = object({
  name: string(),
  patterns: array(patternSchema),
  repository: optional(
    record(string(), union([patternSchema, array(patternSchema)])),
  ),
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

  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, `${name}.ts`),
    [
      `import type { Language } from "../../language.js";`,
      `export const ${camelName}: Language = ${JSON.stringify(language)}`,
    ].join("\n"),
  );
}
