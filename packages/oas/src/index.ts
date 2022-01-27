import { DefaultConverter } from './converter';
import { OpenAPI, Request } from '@har-sdk/core';

export * from './errors';

export const oas2har = (collection: OpenAPI.Document): Promise<Request[]> => {
  if (!collection) {
    throw new TypeError('Please provide a valid OAS specification.');
  }

  return new DefaultConverter().convert(collection);
};
