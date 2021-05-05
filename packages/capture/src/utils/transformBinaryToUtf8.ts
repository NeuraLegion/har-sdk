export const transformBinaryToUtf8 = <T>(value?: T): string | T => {
  if (value === undefined || value === null) {
    return value;
  }

  return Buffer.from(String(value), 'binary').toString('utf8');
};
