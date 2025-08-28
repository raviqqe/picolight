import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/pattern.ts",
    "src/token.ts",
    "src/languages/*.ts",
    "src/themes/*.ts",
  ],
  minify: true,
  platform: "browser",
});
