export const highlight = (
  text: string,
  patterns: [RegExp, (text: string) => Element][],
): string => {
  for (const [pattern, convert] of patterns) {
    const index = pattern.exec(text)?.index;

    if (foo) {
    }

    text = text.slice(index ?? 0);
  }

  return text;
};
