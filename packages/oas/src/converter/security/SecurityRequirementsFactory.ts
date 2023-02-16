import type { Sampler } from '../Sampler';
import { isOASV3 } from '../../utils';
import { Oas3SecurityRequirementsParser } from './Oas3SecurityRequirementsParser';
import { Oas2SecurityRequirementsParser } from './Oas2SecurityRequirementsParser';
import type { SecurityRequirementsParser } from './SecurityRequirementsParser';
import type { OpenAPI, OpenAPIV2 } from '@har-sdk/core';

export class SecurityRequirementsFactory {
  constructor(private readonly sampler: Sampler) {}

  public create<T extends OpenAPI.Document>(spec: T) {
    return isOASV3(spec)
      ? this.createSecurityRequirementsParser(
          spec,
          Oas3SecurityRequirementsParser
        )
      : this.createSecurityRequirementsParser(
          spec as OpenAPIV2.Document,
          Oas2SecurityRequirementsParser
        );
  }

  private createSecurityRequirementsParser<T extends OpenAPI.Document>(
    spec: T,
    parserType: new (spec: T, sampler: Sampler) => SecurityRequirementsParser<T>
  ): SecurityRequirementsParser<T> {
    return new parserType(spec, this.sampler);
  }
}
