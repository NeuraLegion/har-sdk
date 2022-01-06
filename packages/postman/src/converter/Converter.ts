import { Postman, Request } from '@har-sdk/core';

export interface Converter {
  convert(collection: Postman.Document): Promise<Request[]>;
}
