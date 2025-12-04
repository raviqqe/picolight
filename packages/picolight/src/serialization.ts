import type { Language } from "./language.js";

export const serializeLanguage = (language: Language): string =>
  JSON.stringify(language, (_: string, value: unknown): unknown =>
    value instanceof RegExp ? { _r: value.source } : value,
  );

export const deserializeLanguage = (string: string): Language =>
  JSON.parse(string, (_key: string, value: unknown): unknown =>
    value instanceof Object && "_r" in value && typeof value._r === "string"
      ? new RegExp(value._r)
      : value,
  );
