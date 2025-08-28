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
      const match = pattern.exec(text);

      if (match) {
        fragment.appendChild(convert(text.slice(0, match.index)));
        text = text.slice(match.index);
        break;
      }
    }
  }

  return fragment;
};
