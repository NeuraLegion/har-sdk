import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { ConverterOptions } from '../../Converter';
import type { Sampler } from '../../Sampler';
import type { Header, OpenAPIV2 } from '@har-sdk/core';

export class BasicSecurityScheme extends SecurityScheme<
  OpenAPIV2.SecuritySchemeBasic,
  Header
> {
  get location(): InjectionLocation {
    return 'headers';
  }

  constructor(
    schema: OpenAPIV2.SecuritySchemeBasic,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(schema, sampler, options);
  }

  public createCredentials(): Header {
    return this.createAuthorizationHeader('authorization', 'Basic');
  }
}
