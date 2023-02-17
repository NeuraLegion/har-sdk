import { OpenAPISchema } from '../samplers';

export interface Serializer {
  serialize(data: unknown, schema: OpenAPISchema): string;
}
