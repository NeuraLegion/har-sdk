import { Traverse } from '../traverse';
import { OpenAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';

export class NullSampler extends Sampler {
  constructor(traverse: Traverse) {
    super(traverse);
  }

  public sample(
    _schema: OpenAPISampler.Schema,
    _spec?: OpenAPISampler.Specification,
    _options?: OpenAPISampler.Options
  ): null {
    return null;
  }
}
