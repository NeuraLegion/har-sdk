import { Options, Specification } from '../traverse';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export type OpenAPISchema = OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject;

export interface Sampler {
  sample(schema: OpenAPISchema, spec?: Specification, options?: Options): any;
}
