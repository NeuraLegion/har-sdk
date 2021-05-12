import { Sampler } from './Sampler';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export class NullSampler implements Sampler {
  public sample(
    _schema: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): null {
    return null;
  }
}
