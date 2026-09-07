import { warn } from "node:console";
import { mapValues } from "es-toolkit";
import { toRegExp } from "oniguruma-to-es";
import { array, object, optional, record, string, union, type z } from "zod";
import type { Language, Lexer } from "../language.ts";
import type { Token } from "../token.ts";

const captureSchema = record(
  string(),
  union([string(), object({ name: optional(string()) })]),
);

const patternSchema = object({
  begin: optional(string()),
  beginCaptures: optional(captureSchema),
  captures: optional(captureSchema),
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

const tokenize = (scope: string | undefined): Token | undefined =>
  scope?.split(".")[0] as Token | undefined;

const compileSource = (source: string): string | null => {
  try {
    return toRegExp(source).source;
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
        typeof capture === "string" ? [] : (tokenize(capture.name) ?? []),
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

  return tokens.length > 1 ? null : tokens.length ? tokens : token ? [token] : [];
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

const collectAlternatives = (
  patterns: Pattern[],
  repository: Repository,
  visited: Set<string>,
): string[] =>
  patterns.flatMap((pattern): string[] => {
    if (pattern.include) {
      return collectAlternatives(
        resolveInclude(pattern.include, repository, visited),
        repository,
        visited,
      );
    }

    if (pattern.match) {
      const source = compileSource(pattern.match);

      // Backreferences would point at wrong groups in a composed pattern.
      return source && !/\\[1-9]/.test(source) ? [source] : [];
    }

    return pattern.begin
      ? []
      : collectAlternatives(pattern.patterns ?? [], repository, visited);
  });

// A region with a styled name is matched as a whole, with its nested patterns
// consumed but never its end.
const compileRegion = (
  begin: string,
  { end, name, patterns = [] }: Pattern,
  repository: Repository,
): Lexer[] => {
  const token = tokenize(name);

  if (!token || token === "meta" || !end) {
    return [];
  }

  const beginSource = compileSource(begin);
  const endSource = compileSource(end);

  return beginSource && endSource
    ? createLexer(
        `(?:${beginSource})(?:(?!${endSource})(?:${[...collectAlternatives(patterns, repository, new Set()), "[^]"].join("|")}))*(?:${endSource}|$)`,
        [token],
      )
    : [];
};

const compilePatterns = (
  patterns: Pattern[],
  repository: Repository,
  visited: Set<string>,
): Lexer[] =>
  patterns.flatMap((pattern): Lexer[] => {
    if (pattern.include) {
      return compilePatterns(
        resolveInclude(pattern.include, repository, visited),
        repository,
        visited,
      );
    }

    if (pattern.match) {
      return compileSpan(pattern.match, pattern.name, pattern.captures);
    }

    if (pattern.begin) {
      const region = compileRegion(pattern.begin, pattern, repository);

      return region.length
        ? region
        : [
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
            ...compilePatterns(pattern.patterns ?? [], repository, visited),
          ];
    }

    return compilePatterns(pattern.patterns ?? [], repository, visited);
  });

export const compileGrammar = ({
  patterns,
  repository = {},
}: Grammar): Language => ({
  lexers: compilePatterns(
    patterns,
    mapValues(repository, (rule) =>
      Array.isArray(rule) ? { patterns: rule } : rule,
    ),
    new Set(),
  ),
});
