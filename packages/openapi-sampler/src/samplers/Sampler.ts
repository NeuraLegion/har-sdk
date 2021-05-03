import { Traverse } from '../traverse';
import { OpenAPISampler } from '../types/openapi-sampler';

export interface ISampler {
  sample(
    schema: OpenAPISampler.Schema,
    spec: OpenAPISampler.Specification,
    options?: OpenAPISampler.Options
  ): any;
}

export abstract class Sampler {
  constructor(protected readonly traverse: Traverse) {}

  public abstract sample(
    schema: OpenAPISampler.Schema,
    spec?: OpenAPISampler.Specification,
    options?: OpenAPISampler.Options
  ): any;
}
