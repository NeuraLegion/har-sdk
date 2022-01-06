import { OpenAPI, Request } from '@har-sdk/core';

export interface Converter {
  convert(collection: OpenAPI.Document): Promise<Request[]>;
}
