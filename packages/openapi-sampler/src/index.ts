import {
  ArraySampler,
  BooleanSampler,
  NullSampler,
  NumberSampler,
  ObjectSampler,
  Sampler,
  StringSampler
} from './samplers';
import { DefaultTraverse, Options, Schema, Specification } from './traverse';

export const SAMPLER_MAP: Map<string, Sampler> = new Map();

export const sample = (
  schema: Schema,
  options?: Options,
  spec?: Specification
): any | undefined => {
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
