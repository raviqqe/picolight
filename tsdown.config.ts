import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/languages/*.ts", "src/themes/*.ts"],
  platform: "browser",
});
