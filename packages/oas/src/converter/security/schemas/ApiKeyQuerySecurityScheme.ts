import { InjectionLocation, SecurityScheme } from './SecuritySchema';
import type { ConverterOptions } from '../../Converter';
import type { Sampler } from '../../Sampler';
import type { OpenAPIV2, OpenAPIV3, QueryString } from '@har-sdk/core';

export class ApiKeyQuerySecurityScheme extends SecurityScheme<
  OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
  QueryString
> {
  get location(): InjectionLocation {
    return 'queryString';
  }

  constructor(
    schema: OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(schema, sampler, options);
  }

  public createCredentials(): QueryString {
    return this.createQueryString(this.schema.name ?? 'token');
  }
}
