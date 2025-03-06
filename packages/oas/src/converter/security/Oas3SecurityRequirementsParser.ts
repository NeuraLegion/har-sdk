import { SecurityRequirementsParser } from './SecurityRequirementsParser';
import type { Sampler } from '../Sampler';
import { HttpSecurityScheme } from './schemas';
import type { SecurityScheme } from './schemas';
import type { SecuritySchemeObject } from '../../types';
import type { ConverterOptions } from '../Converter';
import type { Cookie, Header, OpenAPIV3, QueryString } from '@har-sdk/core';

export class Oas3SecurityRequirementsParser extends SecurityRequirementsParser<OpenAPIV3.Document> {
  constructor(
    spec: OpenAPIV3.Document,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(spec, sampler, options);
  }

  protected getSecuritySchemes():
    | Record<string, OpenAPIV3.SecuritySchemeObject>
    | undefined {
    return this.spec.components?.securitySchemes as Record<
      string,
      OpenAPIV3.SecuritySchemeObject
    >;
  }

  protected override createSchema(
    securityScheme: OpenAPIV3.SecuritySchemeObject
  ):
    | SecurityScheme<SecuritySchemeObject, QueryString | Header | Cookie>
    | undefined {
    const parser = super.createSchema(securityScheme);

    if (parser) {
      return parser;
    }

    if (securityScheme.type === 'http') {
      return new HttpSecurityScheme(securityScheme, this.sampler, this.options);
    }
  }
}
