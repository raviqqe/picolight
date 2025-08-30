import { highlight, type Language } from "picolight";
import { githubDark } from "picolight/themes/github-dark";
import { githubLight } from "picolight/themes/github-light";

export const defineElement = (language: Language) => {
  window.customElements.define(
    "picolight-example",
    class extends HTMLElement {
      public async connectedCallback(): Promise<void> {
        const pre = this.querySelector("pre");
        const code = this.querySelector("code");

        if (!pre || !code) {
          throw new Error("Root elements missing");
        }

        const update = (dark: boolean): void => {
          const theme = dark ? githubDark : githubLight;

          pre.style = `background:${theme.back}`;
          code.innerHTML = highlight(
            this.dataset.source ?? "",
            language,
            theme,
          ).outerHTML;
        };

        const query = window.matchMedia("(prefers-color-scheme: dark)");

        update(query.matches);

        query.addEventListener("change", ({ matches }) => update(matches));
      }
    },
  );
};
