import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export interface Options {
  skipReadOnly: boolean;
  skipWriteOnly: boolean;
  skipNonRequired: boolean;
  quiet: boolean;
}

export interface Sample {
  value: unknown;
  type?: string | string[];
  readOnly?: boolean;
  writeOnly?: boolean;
}

export interface Traverse {
  clearCache(): void;

  traverse(
    schema:
      | OpenAPIV3.ReferenceObject
      | OpenAPIV2.ReferenceObject
      | OpenAPIV3.SchemaObject
      | OpenAPIV2.SchemaObject,
    options: Options,
    spec: OpenAPIV2.Document | OpenAPIV3.Document
  ): Sample;
}
