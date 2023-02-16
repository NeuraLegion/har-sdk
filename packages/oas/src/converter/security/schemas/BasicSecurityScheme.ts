import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { Sampler } from '../../Sampler';
import type { Header, OpenAPIV2, Request } from '@har-sdk/core';

export class BasicSecurityScheme extends SecurityScheme<
  OpenAPIV2.SecuritySchemeBasic,
  Header
> {
  constructor(schema: OpenAPIV2.SecuritySchemeBasic, sampler: Sampler) {
    super(schema, sampler);
  }

  public authorizeRequest(request: Pick<Request, InjectionLocation>): void {
    request.headers.push(this.createCredentials());
  }

  public createCredentials(): Header {
    return this.createHeader('authorization', 'Basic');
  }
}
