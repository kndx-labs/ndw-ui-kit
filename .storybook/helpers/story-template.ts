const LEADING_SPACES = /^ */;

/**
 * Removes the common indentation of the lines after the first one,
 * so a multiline template literal written inside code renders with its own nesting.
 * Blank lines are ignored when the indentation is measured and become empty.
 */
export const dedent = (template: string): string => {
  const [first = '', ...rest] = template.trim().split('\n');
  const indents = rest
    .filter((line) => line.trim() !== '')
    .map((line) => LEADING_SPACES.exec(line)?.[0].length ?? 0);
  const common = indents.length > 0 ? Math.min(...indents) : 0;

  return [first, ...rest.map((line) => line.trim() === '' ? '' : line.slice(common).trimEnd())].join('\n');
};

/** Joins the templates of a fixed story with a newline. */
export const lines = (items: readonly string[]): string => {
  return items.join('\n');
};

export const group = (items: readonly string[]): string => {
  return `<div>\n${lines(items)}\n</div>`;
};
