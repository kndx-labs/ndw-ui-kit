const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
  '`': '&#96;',
};

const reUnescapedHtml = /[&<>"'`]/g;

/**
 * escapes HTML special characters (for internal use).
 */
export const escapeHtml = (str: string): string => {
  return str.replace(reUnescapedHtml, (char) => htmlEscapes[char] ?? char);
};
