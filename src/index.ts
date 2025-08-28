export const highlight = (
  text: string,
  patterns: [RegExp, (text: string) => Element][],
): HTMLElement => {
  const code = document.createElement("code");

  while (text) {
    for (const [pattern, convert] of patterns) {
      const index = pattern.exec(text)?.index;

      if (index) {
        code.appendChild(document.createTextNode(text.slice(0, index)));
        text = text.slice(index);
        break;
      }
    }

    text = text.slice(index ?? 0);
  }

  return code;
};
