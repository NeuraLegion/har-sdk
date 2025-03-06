import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { ConverterOptions } from '../../Converter';
import type { Sampler } from '../../Sampler';
import type { Header, OpenAPIV3 } from '@har-sdk/core';

export class HttpSecurityScheme extends SecurityScheme<
  OpenAPIV3.HttpSecurityScheme,
  Header
> {
  get location(): InjectionLocation {
    return 'headers';
  }

  constructor(
    schema: OpenAPIV3.HttpSecurityScheme,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(schema, sampler, options);
  }

  public createCredentials(): Header {
    const { scheme } = this.schema;
    const prefix = scheme.charAt(0).toUpperCase() + scheme.slice(1);

    return this.createAuthorizationHeader('authorization', prefix);
  }
}
