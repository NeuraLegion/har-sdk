import { OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@har-sdk/core';

export type SchemaObject = (
  | OpenAPIV2.SchemaObject
  | OpenAPIV3.SchemaObject
  | OpenAPIV3_1.SchemaObject
) & {
  contentMediaType?: string;
  contentEncoding?: string;
};

export type MediaTypeObject =
  | OpenAPIV3.MediaTypeObject
  | OpenAPIV3_1.MediaTypeObject;

export interface EncodingHandler {
  isArbitraryBinary(mediaType: string, schema?: SchemaObject): boolean;

  shouldEncodeProperties(mediaType: string, media: MediaTypeObject): boolean;

  resolvePropertyContentType(value: unknown, schema?: SchemaObject): string;
}
