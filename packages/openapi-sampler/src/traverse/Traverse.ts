import { OAPISampler } from '../types/openapi-sampler';

export interface Traverse {
  clearCache(): void;
  traverse(
    schema: OAPISampler.Schema,
    options: OAPISampler.Options,
    spec: OAPISampler.Specification
  ): OAPISampler.Sample;
}
