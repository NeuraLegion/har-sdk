import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { Sampler } from '../../Sampler';
import type { Header, OpenAPIV2, OpenAPIV3, Request } from '@har-sdk/core';

export class ApiKeyHeaderSecurityScheme extends SecurityScheme<
  OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
  Header
> {
  constructor(
    schema: OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
    sampler: Sampler
  ) {
    super(schema, sampler);
  }

  public authorizeRequest(request: Pick<Request, InjectionLocation>): void {
    request.headers.push(this.createCredentials());
  }

  public createCredentials(): Header {
    return this.createAuthorizationHeader(this.schema.name);
  }
}
