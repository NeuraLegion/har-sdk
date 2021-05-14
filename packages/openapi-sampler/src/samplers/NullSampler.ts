import { Sampler, OpenAPISchema } from './Sampler';

export class NullSampler implements Sampler {
  public sample(_schema: OpenAPISchema): null {
    return null;
  }
}
