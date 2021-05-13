import { Sampler, SamplerSchema } from './Sampler';
import faker from 'faker';

export class BooleanSampler implements Sampler {
  public sample(_schema: SamplerSchema): boolean {
    return faker.datatype.boolean();
  }
}
