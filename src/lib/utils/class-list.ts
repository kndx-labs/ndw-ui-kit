export const normalizeClass = (
  classOrList: string | string[] | undefined,
  fallbackClass: string,
): string[] => {
  if (classOrList === undefined || classOrList === null) {
    return [fallbackClass];
  }

  if (Array.isArray(classOrList)) {
    return classOrList.length > 0 ? classOrList : [fallbackClass];
  }

  return [classOrList];
};
