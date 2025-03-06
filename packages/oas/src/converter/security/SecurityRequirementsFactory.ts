import type { Sampler } from '../Sampler';
import { isOASV3 } from '../../utils';
import { ConverterOptions } from '../Converter';
import { Oas3SecurityRequirementsParser } from './Oas3SecurityRequirementsParser';
import { Oas2SecurityRequirementsParser } from './Oas2SecurityRequirementsParser';
import type { SecurityRequirementsParser } from './SecurityRequirementsParser';
import type { OpenAPI, OpenAPIV2 } from '@har-sdk/core';

export class SecurityRequirementsFactory {
  constructor(
    private readonly sampler: Sampler,
    private readonly options: ConverterOptions
  ) {}

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
    parserType: new (
      spec: T,
      sampler: Sampler,
      options: ConverterOptions
    ) => SecurityRequirementsParser<T>
  ): SecurityRequirementsParser<T> {
    return new parserType(spec, this.sampler, this.options);
  }
}
