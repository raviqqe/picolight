import { log } from "node:console";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { grammars } from "tm-grammars";
import { parse } from "zod";
import type { Language } from "../language.ts";
import { serializeLanguage } from "../serialization.ts";
import { compileGrammar, grammarSchema } from "./grammar.ts";

const directory = "src/languages/experimental";

const compileLanguage = async (language: string): Promise<Language> => {
  log(`Compiling ${language}`);

  return compileGrammar(
    parse(
      grammarSchema,
      (
        await import(`tm-grammars/grammars/${language}.json`, {
          with: { type: "json" },
        })
      ).default,
    ),
  );
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
      `export const ${camelName}: Language = deserializeLanguage(${JSON.stringify(serializeLanguage(language))})`,
    ].join("\n"),
  );
}
