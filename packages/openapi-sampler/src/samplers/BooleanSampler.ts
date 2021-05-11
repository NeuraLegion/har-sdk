import { OAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';
import faker from 'faker';

export class BooleanSampler implements Sampler {
  public sample(
    _schema: OAPISampler.Schema,
    _spec?: OAPISampler.Specification,
    _options?: OAPISampler.Options
  ): boolean {
    return faker.random.boolean();
  }
}
