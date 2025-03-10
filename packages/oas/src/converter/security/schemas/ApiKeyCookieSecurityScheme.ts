import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { ConverterOptions } from '../../Converter';
import type { Sampler } from '../../Sampler';
import type { Cookie, OpenAPIV3, Request } from '@har-sdk/core';

export class ApiKeyCookieSecurityScheme extends SecurityScheme<
  OpenAPIV3.ApiKeySecurityScheme,
  Cookie
> {
  get location(): InjectionLocation {
    return 'cookies';
  }

  constructor(
    schema: OpenAPIV3.ApiKeySecurityScheme,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(schema, sampler, options);
  }

  public override authorizeRequest(
    request: Pick<Request, InjectionLocation>
  ): void {
    const credentials = this.createCredentials();
    if (!request.cookies?.some((cookie) => cookie.name === credentials.name)) {
      request.cookies.push(credentials);
      request.headers.push(this.createCookieHeader(credentials));
    }
  }

  public createCredentials(): Cookie {
    return this.createCookie(this.schema.name ?? 'session');
  }
}
