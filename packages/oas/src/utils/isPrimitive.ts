export const isPrimitive = (
  value: unknown
): value is null | undefined | string | boolean | number | bigint | symbol =>
  // ADHOC: typeof null === 'object'
  value === null ||
  value === undefined ||
  (typeof value !== 'object' && typeof value !== 'function');
