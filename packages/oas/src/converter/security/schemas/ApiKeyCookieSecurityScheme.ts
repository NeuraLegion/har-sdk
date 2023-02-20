import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { Sampler } from '../../Sampler';
import type { Cookie, OpenAPIV3, Request } from '@har-sdk/core';

export class ApiKeyCookieSecurityScheme extends SecurityScheme<
  OpenAPIV3.ApiKeySecurityScheme,
  Cookie
> {
  get location(): InjectionLocation {
    return 'cookies';
  }

  constructor(schema: OpenAPIV3.ApiKeySecurityScheme, sampler: Sampler) {
    super(schema, sampler);
  }

  public override authorizeRequest(
    request: Pick<Request, InjectionLocation>
  ): void {
    const credentials = this.createCredentials();
    request.cookies.push(credentials);
    request.headers.push(this.createCookieHeader(credentials));
  }

  public createCredentials(): Cookie {
    return this.createCookie(this.schema.name ?? 'session');
  }
}
