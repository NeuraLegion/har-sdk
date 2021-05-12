import { Options } from '../traverse';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export interface Sampler {
  sample(
    schema: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject,
    spec?: OpenAPIV3.Document & OpenAPIV2.Document,
    options?: Options
  ): any;
}
