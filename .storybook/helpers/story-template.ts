/** Joins the templates of a fixed story into one template, one element per line. */
export const lines = (items: readonly string[]): string => {
  return items.join('\n');
};
