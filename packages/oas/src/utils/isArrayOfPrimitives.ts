import { isPrimitive } from './isPrimitive';

export const isArrayOfPrimitives = (value: unknown): boolean =>
  Array.isArray(value) && value.every((item: unknown) => isPrimitive(item));
