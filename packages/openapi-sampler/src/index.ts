import {
  ArraySampler,
  BooleanSampler,
  NullSampler,
  NumberSampler,
  ObjectSampler,
  Sampler,
  StringSampler
} from './samplers';
import { DefaultTraverse, Options } from './traverse';
import { IJsonSchema, OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export const SAMPLER_MAP: Map<string, Sampler> = new Map();

export const sample = (
  schema:
    | OpenAPIV3.ReferenceObject
    | OpenAPIV2.ReferenceObject
    | OpenAPIV3.SchemaObject
    | OpenAPIV2.SchemaObject
    | IJsonSchema,
  options: Options,
  spec: OpenAPIV2.Document | OpenAPIV3.Document
): unknown | undefined => {
  const opts = Object.assign({}, { skipReadOnly: false }, options);

  const traverse = new DefaultTraverse();

  SAMPLER_MAP.set('boolean', new BooleanSampler());
  SAMPLER_MAP.set('null', new NullSampler());
  SAMPLER_MAP.set('array', new ArraySampler(traverse));
  SAMPLER_MAP.set('integer', new NumberSampler());
  SAMPLER_MAP.set('number', new NumberSampler());
  SAMPLER_MAP.set('object', new ObjectSampler(traverse));
  SAMPLER_MAP.set('string', new StringSampler());

  traverse.samplers = SAMPLER_MAP;
  traverse.clearCache();

  return traverse.traverse(schema, opts, spec)?.value;
};
