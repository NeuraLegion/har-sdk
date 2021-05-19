const pad = (number: number) => {
  if (number < 10) {
    return '0' + number;
  }

  return number;
};

const isObject = <T extends Record<string, unknown>>(obj: T): obj is T =>
  obj && typeof obj === 'object';

export const toRFCDateTime = (
  date: Date,
  omitTime: boolean,
  milliseconds: boolean
): string => {
  let res =
    date.getUTCFullYear() +
    '-' +
    pad(date.getUTCMonth() + 1) +
    '-' +
    pad(date.getUTCDate());

  if (!omitTime) {
    res +=
      'T' +
      pad(date.getUTCHours()) +
      ':' +
      pad(date.getUTCMinutes()) +
      ':' +
      pad(date.getUTCSeconds()) +
      (milliseconds
        ? '.' + (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)
        : '') +
      'Z';
  }

  return res;
};

export const ensureLength = (
  sample: string,
  min: number,
  max: number
): string => {
  const minLength = min ? min : 0;
  const maxLength = max ? max : sample.length;

  if (minLength > sample.length) {
    return sample.repeat(Math.trunc(min / sample.length) + 1).substring(0, min);
  }

  return sample.substr(
    0,
    Math.min(Math.max(sample.length, minLength), maxLength)
  );
};

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
