import { Postman } from '@har-sdk/validator';
import HarV1 from 'har-format';

export interface Converter {
  convert(collection: Postman.Document): Promise<HarV1.Request[]>;
}
