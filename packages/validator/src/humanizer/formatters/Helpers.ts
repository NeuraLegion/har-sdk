export const capitalize = (s: string | null): string => {
  if (typeof s !== 'string' || s.length === 0) {
    return s;
  }

  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Ultra-naieve implementation because we only pluralize "character" currently.
 */
export const pluralize = (s: string, num: number): string => {
  if (num === 1) {
    return s;
  }

  return `${s}s`;
};

/**
 * returns "a" or "an" for the given word.
 * Obviously this is not comprehensive, but it covers the possible return values of `typeof`.
 */
export const indefiniteArticle = (s: string): string => {
  switch (s[0]) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
      return 'an';

    default:
      return 'a';
  }
};

/**
 * returns a human-readable type for the given value with an indefinite article if it makes sense.
 */
export const humanizeTypeOf = (value: unknown): string => {
  const raw = typeof value;
  switch (raw) {
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (Array.isArray(value)) {
        return 'an array';
      }

      return 'an object';

    case 'undefined':
      return 'undefined';

    default:
      return `${indefiniteArticle(raw)} ${raw}`;
  }
};

/**
 * returns a human-readable version of the given list of values.
 */
export const humanizeList = (arr: string[], conjunction = 'and'): string => {
  if (arr.length === 0) {
    return 'nothing';
  }
  if (arr.length === 1) {
    return arr[0];
  }
  if (arr.length === 2) {
    return `${arr[0]} ${conjunction} ${arr[1]}`;
  }

  return `${arr.slice(0, -1).join(', ')}, ${conjunction} ${
    arr[arr.length - 1]
  }`;
};
