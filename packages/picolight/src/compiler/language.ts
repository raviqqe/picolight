import { warn } from "node:console";
import { mapValues, partition, range, uniq } from "es-toolkit";
import { toRegExpDetails } from "oniguruma-to-es";
import { is } from "valibot";
import { array, object, optional, record, string, union, type z } from "zod";
import type { Language, Lexer } from "../language.ts";
import { type Token, tokenSchema } from "../token.ts";

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

// A pattern source translated into JavaScript, with the capture groups the
// translation added to emulate Oniguruma.
type Source = { hidden: number[]; source: string };

// Texts matched only by patterns too general to stay in their contexts: a
// letter, a space, a newline, and a control character no language gives a
// meaning to.
const probes = ["a", " ", "\n", "\u0001"];

// Tokens of space-separated scopes, inner scopes first. Only scopes themes
// style become tokens; meta scopes carry structure rather than style.
const tokenize = (scopes = ""): Token[] =>
  uniq(
    scopes
      .split(/\s+/)
      .flatMap((scope) => {
        const token = scope.split(".")[0] ?? "";

        return is(tokenSchema, token) && token !== "meta" ? [token] : [];
      })
      .toReversed(),
  );

const compileSource = (source: string): Source | null => {
  try {
    const { options, pattern } = toRegExpDetails(source, {
      // cspell: ignore backrefs
      rules: { allowOrphanBackrefs: true, captureGroup: true },
    });

    return { hidden: options?.hiddenCaptures ?? [], source: pattern };
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    warn(error.message);
  }

  return null;
};

// Grammars number capture groups without the hidden ones.
const translateGroup = (group: number, hidden: number[]): number =>
  range(1, group + hidden.length + 1).filter(
    (candidate) => !hidden.includes(candidate),
  )[group - 1] ?? 0;

const createLexer = (
  source: string,
  tokens: Token[],
  captures: Record<number, Token[]> = {},
): Lexer[] => {
  try {
    return [
      Object.keys(captures).length
        ? [new RegExp(source, "dvy"), tokens, captures]
        : [new RegExp(source, "vy"), tokens],
    ];
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    warn(error.message);
  }

  return [];
};

const captureTokens = (
  captures: Captures | undefined,
  hidden: number[],
): Record<number, Token[]> =>
  Object.fromEntries(
    Object.entries(captures ?? {}).flatMap(([group, scopes]) => {
      const tokens =
        typeof scopes === "string"
          ? []
          : uniq([scopes].flat().flatMap((scope) => tokenize(scope.name)));

      return tokens.length
        ? [[translateGroup(Number(group), hidden), tokens]]
        : [];
    }),
  );

// A styled name colors a whole span, and captures color its pieces otherwise.
const compileSpan = (
  source: string,
  name: string | undefined,
  captures: Captures | undefined,
): Lexer[] => {
  const compiled = compileSource(source);
  const tokens = tokenize(name);

  if (!compiled) {
    return [];
  }

  if (tokens.length) {
    return createLexer(compiled.source, tokens);
  }

  const { 0: whole = [], ...groups } = captureTokens(captures, compiled.hidden);

  return createLexer(compiled.source, whole, groups);
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
      const compiled = compileSource(pattern.match);

      return compiled && isEscape(compiled.source) ? [compiled.source] : [];
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
  const tokens = tokenize(name ?? contentName);

  if (!tokens.length || !end) {
    return [];
  }

  const compiledBegin = compileSource(begin);
  const compiledEnd = compileSource(end);

  return compiledBegin && compiledEnd
    ? createLexer(
        `(?:${compiledBegin.source})(?:(?!${compiledEnd.source})(?:${[...collectEscapes(patterns, repository, new Set()), "[^]"].join("|")}))*(?:${compiledEnd.source}|$)`,
        tokens,
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

// Patterns in outer contexts take precedence over ones in nested contexts.
// Patterns too general to stay in their contexts come last in the top-level
// context and are dropped in nested ones.
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
  const [specific, general] = partition(
    compiled.flatMap(({ lexers }) => lexers),
    isSpecific,
  );

  return [
    ...specific,
    ...compileLevels(
      compiled.flatMap(({ nested }) => nested),
      repository,
      visited,
      depth + 1,
    ),
    ...(depth ? [] : general),
  ];
};

export const compileGrammar = ({
  patterns,
  repository = {},
}: Grammar): Language =>
  compileLevels(
    [patterns],
    mapValues(repository, (rule) =>
      Array.isArray(rule) ? { patterns: rule } : rule,
    ),
    new Set(),
  );
