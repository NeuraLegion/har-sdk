import HarV1 from 'har-format';
import { OAS } from '@har-sdk/validator';

export interface Converter {
  convert(collection: OAS.Document): Promise<HarV1.Request[]>;
}
