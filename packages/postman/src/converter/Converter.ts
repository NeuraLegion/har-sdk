import { Postman, Request } from '@har-sdk/types';

export interface Converter {
  convert(collection: Postman.Document): Promise<Request[]>;
}
