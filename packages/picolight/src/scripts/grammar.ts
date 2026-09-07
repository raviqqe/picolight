import { warn } from "node:console";
import { mapValues } from "es-toolkit";
import { toRegExp } from "oniguruma-to-es";
import { array, object, optional, record, string, union, type z } from "zod";
import type { Language, Lexer } from "../language.ts";
import type { Token } from "../token.ts";

const scopeSchema = object({ name: optional(string()) });

// Some grammars put arrays where capture maps or scopes are expected.
const captureSchema = union([
  record(string(), union([string(), scopeSchema, array(scopeSchema)])),
  array(scopeSchema),
]);

const patternSchema = object({
  begin: optional(string()),
  beginCaptures: optional(captureSchema),
  captures: optional(captureSchema),
  contentName: optional(string()),
  end: optional(string()),
  endCaptures: optional(captureSchema),
  include: optional(string()),
  match: optional(string()),
  name: optional(string()),
  get patterns() {
    return optional(array(patternSchema));
  },
});

export const grammarSchema = object({
  patterns: array(patternSchema),
  repository: optional(
    record(string(), union([patternSchema, array(patternSchema)])),
  ),
});

type Captures = z.infer<typeof captureSchema>;
type Pattern = z.infer<typeof patternSchema>;
type Repository = Record<string, Pattern>;
export type Grammar = z.infer<typeof grammarSchema>;

type Level = { lexers: Lexer[]; nested: Pattern[][] };

// Texts matched only by patterns too general for their nested contexts.
const probes = ["a", " ", "\n"];

const tokenize = (scope: string | undefined): Token | undefined =>
  scope?.split(".")[0] as Token | undefined;

const compileSource = (source: string): string | null => {
  try {
    // cspell: ignore backrefs
    return toRegExp(source, { rules: { allowOrphanBackrefs: true } }).source;
  } catch (error) {
    warn((error as Error).message);
  }

  return null;
};

const createLexer = (source: string, tokens: Token[]): Lexer[] => {
  try {
    return [[new RegExp(source, "vy"), tokens]];
  } catch (error) {
    warn((error as Error).message);
  }

  return [];
};

const captureTokens = (captures: Captures = {}): Token[] =>
  [
    ...new Set(
      Object.values(captures).flatMap((capture) =>
        typeof capture === "string"
          ? []
          : [capture].flat().flatMap((scope) => tokenize(scope.name) ?? []),
      ),
    ),
  ].filter((token) => token !== "meta");

// Tokens of a span, or null if its captures need different tokens.
const compileTokens = (
  name: string | undefined,
  captures: Captures | undefined,
): Token[] | null => {
  const token = tokenize(name);
  const tokens = token && token !== "meta" ? [token] : captureTokens(captures);

  return tokens.length > 1
    ? null
    : tokens.length
      ? tokens
      : token
        ? [token]
        : [];
};

const compileSpan = (
  source: string,
  name: string | undefined,
  captures: Captures | undefined,
): Lexer[] => {
  const tokens = compileTokens(name, captures);
  const compiled = tokens && compileSource(source);

  return tokens && compiled ? createLexer(compiled, tokens) : [];
};

const resolveInclude = (
  include: string,
  repository: Repository,
  visited: Set<string>,
): Pattern[] => {
  const name = include.replace(/^#/, "");
  const rule = repository[name];

  if (!rule || visited.has(name)) {
    return [];
  }

  visited.add(name);

  return [rule];
};

// Only escape sequences are inlined into regions as other patterns might
// consume their ends. Backreferences would point at wrong groups.
const isEscape = (source: string): boolean =>
  /^(?:\((?:\?:|\?<[^>]*>)?)*\\\\/.test(source) && !/\\[1-9]/.test(source);

const collectEscapes = (
  patterns: Pattern[],
  repository: Repository,
  visited: Set<string>,
): string[] =>
  patterns.flatMap((pattern): string[] => {
    if (pattern.include) {
      return collectEscapes(
        resolveInclude(pattern.include, repository, visited),
        repository,
        visited,
      );
    }

    if (pattern.match) {
      const source = compileSource(pattern.match);

      return source && isEscape(source) ? [source] : [];
    }

    return pattern.begin
      ? []
      : collectEscapes(pattern.patterns ?? [], repository, visited);
  });

// A region with a styled name is matched as a whole, with its nested escapes
// consumed but never its end.
const compileRegion = (
  begin: string,
  { contentName, end, name, patterns = [] }: Pattern,
  repository: Repository,
): Lexer[] => {
  const token = tokenize(name ?? contentName);

  if (!token || token === "meta" || !end) {
    return [];
  }

  const beginSource = compileSource(begin);
  const endSource = compileSource(end);

  return beginSource && endSource
    ? createLexer(
        `(?:${beginSource})(?:(?!${endSource})(?:${[...collectEscapes(patterns, repository, new Set()), "[^]"].join("|")}))*(?:${endSource}|$)`,
        [token],
      )
    : [];
};

const compileLevel = (
  patterns: Pattern[],
  repository: Repository,
  visited: Set<string>,
): Level => {
  const levels = patterns.map((pattern): Level => {
    if (pattern.include) {
      return compileLevel(
        resolveInclude(pattern.include, repository, visited),
        repository,
        visited,
      );
    }

    if (pattern.match) {
      return {
        lexers: compileSpan(pattern.match, pattern.name, pattern.captures),
        nested: [],
      };
    }

    if (pattern.begin) {
      const region = compileRegion(pattern.begin, pattern, repository);

      return region.length
        ? { lexers: region, nested: [] }
        : {
            lexers: [
              ...compileSpan(
                pattern.begin,
                pattern.name,
                pattern.beginCaptures ?? pattern.captures,
              ),
              ...(pattern.end
                ? compileSpan(
                    pattern.end,
                    pattern.name,
                    pattern.endCaptures ?? pattern.captures,
                  )
                : []),
            ],
            nested: pattern.patterns ? [pattern.patterns] : [],
          };
    }

    return compileLevel(pattern.patterns ?? [], repository, visited);
  });

  return {
    lexers: levels.flatMap(({ lexers }) => lexers),
    nested: levels.flatMap(({ nested }) => nested),
  };
};

const isSpecific = ([pattern]: Lexer): boolean =>
  !probes.some((probe) => {
    pattern.lastIndex = 0;

    return pattern.test(probe);
  });

// Patterns in outer contexts take precedence over ones in nested contexts, and
// nested contexts drop patterns too general to go beyond them.
const compileLevels = (
  levels: Pattern[][],
  repository: Repository,
  visited: Set<string>,
  depth = 0,
): Lexer[] => {
  if (!levels.length) {
    return [];
  }

  const compiled = levels.map((patterns) =>
    compileLevel(patterns, repository, visited),
  );
  const lexers = compiled.flatMap(({ lexers }) => lexers);

  return [
    ...(depth ? lexers.filter(isSpecific) : lexers),
    ...compileLevels(
      compiled.flatMap(({ nested }) => nested),
      repository,
      visited,
      depth + 1,
    ),
  ];
};

export const compileGrammar = ({
  patterns,
  repository = {},
}: Grammar): Language => ({
  lexers: compileLevels(
    [patterns],
    mapValues(repository, (rule) =>
      Array.isArray(rule) ? { patterns: rule } : rule,
    ),
    new Set(),
  ),
});
