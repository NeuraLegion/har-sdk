import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { ConverterOptions } from '../../Converter';
import type { Sampler } from '../../Sampler';
import type { Header, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export class ApiKeyHeaderSecurityScheme extends SecurityScheme<
  OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
  Header
> {
  get location(): InjectionLocation {
    return 'headers';
  }

  constructor(
    schema: OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(schema, sampler, options);
  }

  public createCredentials(): Header {
    return this.createAuthorizationHeader(this.schema.name);
  }
}
