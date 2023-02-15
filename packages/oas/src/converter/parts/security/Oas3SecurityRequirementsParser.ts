import { SecurityRequirementsParser } from './SecurityRequirementsParser';
import { Sampler } from '../Sampler';
import { Header, OpenAPIV3, QueryString } from '@har-sdk/core';

export class Oas3SecurityRequirementsParser extends SecurityRequirementsParser<OpenAPIV3.Document> {
  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected getSecuritySchemes():
    | Record<string, OpenAPIV3.SecuritySchemeObject>
    | undefined {
    return this.spec.components?.securitySchemes as Record<
      string,
      OpenAPIV3.SecuritySchemeObject
    >;
  }

  protected override parseSecurityScheme(
    securityScheme: OpenAPIV3.SecuritySchemeObject
  ): Header | QueryString | undefined {
    const header = super.parseSecurityScheme(securityScheme);

    if (header) {
      return header;
    }

    const httpScheme =
      'scheme' in securityScheme
        ? securityScheme.scheme.toLowerCase()
        : undefined;

    switch (httpScheme) {
      case 'basic':
        return this.createHeader('Basic');
      case 'bearer':
        return this.createHeader('Bearer');
      default:
        return this.parseApiKeyScheme(securityScheme);
    }
  }
}
