import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { ConverterOptions } from '../../Converter';
import type { Sampler } from '../../Sampler';
import type { Header, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export class BearerSecurityScheme extends SecurityScheme<
  OpenAPIV2.SecuritySchemeOauth2 | OpenAPIV3.OAuth2SecurityScheme,
  Header
> {
  get location(): InjectionLocation {
    return 'headers';
  }

  constructor(
    schema: OpenAPIV2.SecuritySchemeOauth2 | OpenAPIV3.OAuth2SecurityScheme,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(schema, sampler, options);
  }

  public createCredentials(): Header {
    return this.createAuthorizationHeader('authorization', 'Bearer');
  }
}
