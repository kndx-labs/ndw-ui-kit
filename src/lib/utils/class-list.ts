/** Keeps the default class, removes empty strings and duplicates; use an empty default for no default class. */
export const normalizeClass = (
  classOrList: string | string[] | undefined | null,
  defaultClass: string,
): string[] => {
  const callerClasses = Array.isArray(classOrList) ? classOrList : [classOrList];
  const classes = [defaultClass, ...callerClasses].filter((value): value is string => {
    return typeof value === 'string' && value !== '';
  });

  return [...new Set(classes)];
};
