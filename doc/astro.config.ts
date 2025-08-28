import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

export default defineConfig({
  base: "/picolight",
  integrations: [mdx()],
  site: "https://raviqqe.com/picolight",
});
