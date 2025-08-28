export type Pattern = [RegExp, (text: string) => Node];

export const highlight = (
  text: string,
  patterns: Pattern[],
): DocumentFragment => {
  const fragment = document.createDocumentFragment();

  while (text) {
    for (const [pattern, convert] of [
      ...patterns,
      [/./, (text) => document.createTextNode(text)] satisfies Pattern,
    ]) {
      const index = pattern.exec(text)?.index;

      if (index) {
        fragment.appendChild(convert(text.slice(0, index)));
        text = text.slice(index);
        break;
      }
    }
  }

  return fragment;
};
