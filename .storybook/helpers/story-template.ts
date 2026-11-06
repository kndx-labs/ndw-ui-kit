/** Joins the templates of a fixed story with a newline. */
export const lines = (items: readonly string[]): string => {
  return items.join('\n');
};

export const group = (items: readonly string[]): string => {
  return `<div>\n${lines(items)}\n</div>`;
};
