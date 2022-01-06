export const isDefined = (x: unknown): boolean => x !== undefined;

export const isDefinedProperty = <T>(x: T, prop: keyof T): boolean =>
  isDefined(x[prop]);
