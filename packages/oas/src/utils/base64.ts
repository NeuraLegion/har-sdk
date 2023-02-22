const normalizeBase64 = (value: string) => encodeURIComponent(value);

export const base64 = (value: string) => {
  if (typeof btoa === 'function') {
    return btoa(normalizeBase64(value));
  } else if (typeof Buffer === 'function') {
    return Buffer.from(value, 'base64').toString('utf-8');
  } else {
    throw new Error(
      'Unable to find either btoa or Buffer in the global scope.'
    );
  }
};
