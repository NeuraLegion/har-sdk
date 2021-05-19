export const isObject = <T>(val: T): boolean =>
  typeof val === 'object' && !Array.isArray(val);
