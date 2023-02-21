import type { OpenAPIV3 } from '@har-sdk/core';

export interface Serializer {
  serialize(data: unknown, schema: OpenAPIV3.SchemaObject): string;
}
