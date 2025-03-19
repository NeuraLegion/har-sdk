import {
  IJsonSchema,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3,
  OpenAPIV3_1
} from '@har-sdk/core';

export interface Options {
  skipReadOnly?: boolean;
  skipWriteOnly?: boolean;
  skipNonRequired?: boolean;
  includeVendorExamples?: boolean;
  quiet?: boolean;
  maxSampleDepth?: number;
}

export interface Sample {
  value: any;
  type?: string | string[];
  readOnly?: boolean;
  writeOnly?: boolean;
}

export type Schema =
  | OpenAPIV3_1.ReferenceObject
  | OpenAPIV3.ReferenceObject
  | OpenAPIV2.ReferenceObject
  | OpenAPIV3_1.SchemaObject
  | OpenAPIV3.SchemaObject
  | OpenAPIV2.SchemaObject
  | IJsonSchema;

export type Specification = OpenAPI.Document;

export interface Traverse {
  clearCache(): void;

  traverse(schema: Schema, options: Options, spec: Specification): Sample;
}
