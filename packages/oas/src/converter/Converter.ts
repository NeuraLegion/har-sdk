import { OAS } from '../types/oas';
import HarV1 from 'har-format';

export interface Converter {
  convert(collection: OAS.Collection): Promise<HarV1.Request[]>;
}
