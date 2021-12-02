import { OpenAPI, Request } from '@har-sdk/types';

export interface Converter {
  convert(collection: OpenAPI.Document): Promise<Request[]>;
}
