import { OpenAPISampler } from '../types/openapi-sampler';

export interface Traverse {
  clearCache(): void;
  traverse(
    schema: OpenAPISampler.Schema,
    options: OpenAPISampler.Options,
    spec: OpenAPISampler.Specification
  ): Record<string, any>;
}
