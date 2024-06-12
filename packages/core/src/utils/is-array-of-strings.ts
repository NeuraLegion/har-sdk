export const isArrayOfStrings = (data: unknown) => !!data && Array.isArray(data)
    ? data.every(item => typeof item === 'string')
    : false;
