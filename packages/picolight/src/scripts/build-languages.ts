import { log, warn } from "node:console";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { toRegExp } from "oniguruma-to-es";
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
  type z,
} from "zod";
import type { Language, Lexer } from "../language.js";
import { serializeLanguage } from "../serialization.js";
import type { Token } from "../token.js";

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
  strictObject({}),
]);

const grammarSchema = object({
  name: string(),
  patterns: array(patternSchema),
  repository: optional(
    record(string(), union([patternSchema, array(patternSchema)])),
  ),
});

type Pattern = z.infer<typeof patternSchema>;

const compileRegularExpression = (source: string): RegExp | null => {
  try {
    return toRegExp(source);
  } catch (error) {
    warn((error as Error).message);
  }

  return null;
};

const compilePattern = (pattern: Pattern): Lexer | null => {
  if ("match" in pattern && "name" in pattern) {
    const expression = compileRegularExpression(pattern.match);

    return expression
      ? [expression, [pattern.name?.split(".")[0] as Token]]
      : null;
  }

  return null;
};

const extractPatternNames = (pattern: Pattern): string[] =>
  "include" in pattern
    ? [pattern.include.replace(/^#/, "")]
    : "patterns" in pattern
      ? (pattern.patterns?.flatMap(extractPatternNames) ?? [])
      : [];

const compileLanguage = async (language: string): Promise<Language> => {
  log(`Compiling ${language}`);

  const { patterns, repository = {} } = parse(
    grammarSchema,
    (
      await import(`tm-grammars/grammars/${language}.json`, {
        with: { type: "json" },
      })
    ).default,
  );

  const lexers: Record<string, Lexer | null> = {};
  const names = patterns.flatMap((pattern) =>
    "include" in pattern ? [pattern.include.replace(/^#/, "")] : [],
  );
  let name: string | undefined;

  while ((name = names.shift())) {
    if (name in lexers) {
      continue;
    }

    lexers[name] = null;

    const pattern = repository?.[name];

    if (!pattern) {
      continue;
    }

    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    let part: Pattern | undefined;

    while ((part = patterns.shift())) {
      lexers[name] = compilePattern(part);
      names.push(...extractPatternNames(part));

      if ("patterns" in part) {
        patterns.push(...(part.patterns ?? []));
      }
    }
  }

  return { lexers: Object.values(lexers).filter((lexer) => !!lexer) };
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
      `import { deserializeLanguage } from "../../serialization.js";`,
      `export const ${camelName}: Language = deserializeLanguage(${serializeLanguage(language)})`,
    ].join("\n"),
  );
}
