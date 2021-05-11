import { OAPISampler } from '../types/openapi-sampler';

export interface Sampler {
  sample(
    schema: OAPISampler.Schema,
    spec?: OAPISampler.Specification,
    options?: OAPISampler.Options
  ): any;
}
