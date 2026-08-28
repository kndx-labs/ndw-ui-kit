export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = {...target};

  for (const key of Object.keys(source) as (keyof T)[]) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (
      srcVal
      && typeof srcVal === 'object'
      && !Array.isArray(srcVal)
      && tgtVal
      && typeof tgtVal === 'object'
    ) {
      result[key] = deepMerge(tgtVal as object, srcVal as object) as T[keyof T];
    } else if (srcVal !== undefined) {
      result[key] = srcVal as T[keyof T];
    }
  }

  return result;
}
