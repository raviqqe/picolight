import type { Language } from "./language.js";

export const serializeLanguage = (language: Language): string =>
  JSON.stringify(language, (_: string, value: unknown): unknown =>
    value instanceof RegExp ? { _r: [value.source, value.flags] } : value,
  );

export const deserializeLanguage = (string: string): Language =>
  JSON.parse(string, (_key: string, value: unknown): unknown =>
    value instanceof Object && "_r" in value && Array.isArray(value._r)
      ? new RegExp(value._r[0], value._r[1])
      : value,
  );
