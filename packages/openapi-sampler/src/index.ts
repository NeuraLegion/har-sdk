import { NumberSampler, ObjectSampler, StringSampler } from './samplers';
import { ArraySampler } from './samplers/ArraySampler';
import { BooleanSampler } from './samplers/BooleanSampler';
import { NullSampler } from './samplers/NullSampler';
import { Sampler } from './samplers/Sampler';
import { DefaultTraverse } from './traverse';
import { OpenAPISampler } from './types/openapi-sampler';

export const SAMPLER_MAP: Map<string, Sampler> = new Map();

export const sample = (
  schema: OpenAPISampler.Schema,
  options: OpenAPISampler.Options,
  spec: OpenAPISampler.Specification
): any => {
  const opts = Object.assign({}, { skipReadOnly: false }, options);

  const traverse = new DefaultTraverse();

  SAMPLER_MAP.set('boolean', new BooleanSampler(traverse));
  SAMPLER_MAP.set('null', new NullSampler(traverse));
  SAMPLER_MAP.set('array', new ArraySampler(traverse));
  SAMPLER_MAP.set('integer', new NumberSampler(traverse));
  SAMPLER_MAP.set('number', new NumberSampler(traverse));
  SAMPLER_MAP.set('object', new ObjectSampler(traverse));
  SAMPLER_MAP.set('string', new StringSampler(traverse));

  traverse.samplers = SAMPLER_MAP;
  traverse.clearCache();

  return traverse.traverse(schema, opts, spec).value;
};
