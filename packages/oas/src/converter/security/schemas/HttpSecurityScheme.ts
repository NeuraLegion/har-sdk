import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { Sampler } from '../../Sampler';
import type { Header, OpenAPIV3, Request } from '@har-sdk/core';

export class HttpSecurityScheme extends SecurityScheme<
  OpenAPIV3.HttpSecurityScheme,
  Header
> {
  constructor(schema: OpenAPIV3.HttpSecurityScheme, sampler: Sampler) {
    super(schema, sampler);
  }

  public authorizeRequest(request: Pick<Request, InjectionLocation>): void {
    request.headers.push(this.createCredentials());
  }

  public createCredentials(): Header {
    const { scheme } = this.schema;
    const prefix = scheme.charAt(0).toUpperCase() + scheme.slice(1);

    return this.createHeader('authorization', prefix);
  }
}
