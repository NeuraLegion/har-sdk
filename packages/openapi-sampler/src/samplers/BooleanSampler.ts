import { Sampler } from './Sampler';
import faker from 'faker';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export class BooleanSampler implements Sampler {
  public sample(
    _schema: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): boolean {
    return faker.datatype.boolean();
  }
}
