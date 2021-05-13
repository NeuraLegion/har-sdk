import { IJsonSchema, OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export interface Options {
  skipReadOnly?: boolean;
  skipWriteOnly?: boolean;
  skipNonRequired?: boolean;
  quiet?: boolean;
}

export interface Sample {
  value: any;
  type?: string | string[];
  readOnly?: boolean;
  writeOnly?: boolean;
}

export type Schema =
  | OpenAPIV3.ReferenceObject
  | OpenAPIV2.ReferenceObject
  | OpenAPIV3.SchemaObject
  | OpenAPIV2.SchemaObject
  | IJsonSchema;

export type Specification = OpenAPIV2.Document | OpenAPIV3.Document;

export interface Traverse {
  clearCache(): void;

  traverse(schema: Schema, options: Options, spec: Specification): Sample;
}
