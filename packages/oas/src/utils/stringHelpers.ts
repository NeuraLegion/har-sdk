export const removeTrailingSlash = (x: string): string => x.replace(/\/$/, '');

export const removeLeadingSlash = (x: string): string => x.replace(/^\//, '');
