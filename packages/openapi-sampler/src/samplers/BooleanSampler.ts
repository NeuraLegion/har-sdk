import { Sampler, OpenAPISchema } from './Sampler';
import faker from 'faker';

export class BooleanSampler implements Sampler {
  public sample(_schema: OpenAPISchema): boolean {
    return faker.datatype.boolean();
  }
}
