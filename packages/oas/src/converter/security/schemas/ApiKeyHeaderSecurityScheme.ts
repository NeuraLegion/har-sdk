import { InjectionLocation, SecurityScheme } from './SecuritySchema';
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
    sampler: Sampler
  ) {
    super(schema, sampler);
  }

  public createCredentials(): Header {
    return this.createAuthorizationHeader(this.schema.name);
  }
}
