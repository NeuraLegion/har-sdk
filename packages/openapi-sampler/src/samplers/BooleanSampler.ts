import { OpenAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';
import faker from 'faker';

export class BooleanSampler extends Sampler {
  public sample(
    _schema: OpenAPISampler.Schema,
    _spec?: OpenAPISampler.Specification,
    _options?: OpenAPISampler.Options
  ): boolean {
    return faker.random.boolean();
  }
}
