import HarV1 from 'har-format';
import { OpenAPI } from '@har-sdk/types';

export interface Converter {
  convert(collection: OpenAPI.Document): Promise<HarV1.Request[]>;
}
