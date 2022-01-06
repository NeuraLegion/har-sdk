const isObject = <T extends Record<string, unknown>>(obj: T): obj is T =>
  obj && typeof obj === 'object';

export const mergeDeep = (
  ...objects: Record<string, any>[]
): Record<string, any> =>
  objects.reduce(
    (prev, obj) => {
      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (isObject(pVal) && isObject(oVal)) {
          prev[key] = mergeDeep(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    },
    Array.isArray(objects[objects.length - 1]) ? [] : {}
  );

export const randomArrayElement = <T>(x: T[]): T | undefined => x[0];
