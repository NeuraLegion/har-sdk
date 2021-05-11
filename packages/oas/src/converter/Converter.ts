import HarV1 from 'har-format';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export type Collection = OpenAPIV2.Document | OpenAPIV3.Document;

export interface Converter {
  convert(collection: Collection): Promise<HarV1.Request[]>;
}
