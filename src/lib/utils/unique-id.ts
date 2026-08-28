let idCounter = 0;

/**
 * Generates a unique id for internal use.
 */
export const uniqueId = (prefix: string = ''): string => {
  return `${prefix}${++idCounter}`;
};
