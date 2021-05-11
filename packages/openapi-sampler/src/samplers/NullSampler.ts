import { OAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';

export class NullSampler implements Sampler {
  public sample(
    _schema: OAPISampler.Schema,
    _spec?: OAPISampler.Specification,
    _options?: OAPISampler.Options
  ): null {
    return null;
  }
}
