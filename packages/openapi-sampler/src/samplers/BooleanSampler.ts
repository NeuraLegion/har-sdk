import { Sampler, OpenAPISchema } from './Sampler';

export class BooleanSampler implements Sampler {
  public sample(_schema: OpenAPISchema): boolean {
    return true;
  }
}
