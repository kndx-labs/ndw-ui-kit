export const getCoerceToClampedNumberTransform = (defaultValue: number, min: number, max: number) => {
  return (value: any): number => {
    const numVal = Number(value);
    const valToClamp = isNaN(numVal) ? defaultValue : numVal;

    return Math.min(max, Math.max(min, valToClamp));
  };
};

export const positiveNumberAttribute = getCoerceToClampedNumberTransform(0, 0, Number.MAX_SAFE_INTEGER);
