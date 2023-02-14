import { SecurityClaim, SecurityParser } from './SecurityParser';
import { Sampler } from '../Sampler';
import { OpenAPIV3 } from '@har-sdk/core';

export class Oas3SecurityParser extends SecurityParser<OpenAPIV3.Document> {
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
  ): SecurityClaim | undefined {
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
        return this.createHeaderClaim('Basic');
      case 'bearer':
        return this.createHeaderClaim('Bearer');
      default:
        return this.parseApiKeyScheme(securityScheme);
    }
  }
}
