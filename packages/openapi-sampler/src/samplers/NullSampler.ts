import { Sampler, SamplerSchema } from './Sampler';

export class NullSampler implements Sampler {
  public sample(_schema: SamplerSchema): null {
    return null;
  }
}
