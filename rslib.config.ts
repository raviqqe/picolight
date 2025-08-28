import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      dts: true,
      format: "esm",
      output: {
        minify: true,
      },
    },
  ],
  source: {
    entry: {
      index: "./src/index.ts",
      "languages/scheme": "./src/languages/scheme.ts",
      "themes/pico-dark": "./src/languages/scheme.ts",
    },
  },
});
