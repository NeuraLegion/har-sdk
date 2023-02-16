import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { Sampler } from '../../Sampler';
import type { OpenAPIV2, OpenAPIV3, QueryString, Request } from '@har-sdk/core';

export class ApiKeyQuerySecurityScheme extends SecurityScheme<
  OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
  QueryString
> {
  constructor(
    schema: OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
    sampler: Sampler
  ) {
    super(schema, sampler);
  }

  public authorizeRequest(request: Pick<Request, InjectionLocation>): void {
    request.queryString.push(this.createCredentials());
  }

  public createCredentials(): QueryString {
    return this.createQueryString(this.schema.name ?? 'token');
  }
}
