import { isObject } from '../../../utils';
import { Sampler } from '../Sampler';
import { HeadersConverter } from './HeadersConverter';
import { Header, OpenAPIV3 } from '@har-sdk/core';

export class Oas3HeadersConverter extends HeadersConverter<OpenAPIV3.Document> {
  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected createContentTypeHeaders(
    pathObj: OpenAPIV3.OperationObject
  ): Header[] {
    const requestBody = pathObj.requestBody as OpenAPIV3.RequestBodyObject;
    if (requestBody?.content && isObject(requestBody?.content)) {
      return this.createHeaders(
        'content-type',
        Object.keys(requestBody.content)
      );
    }

    return [];
  }

  protected createAcceptHeaders(_pathObj: OpenAPIV3.OperationObject): Header[] {
    return [];
  }

  protected getSecuritySchemes():
    | Record<string, OpenAPIV3.SecuritySchemeObject>
    | undefined {
    return this.spec.components.securitySchemes as Record<
      string,
      OpenAPIV3.SecuritySchemeObject
    >;
  }

  protected parseSecurityScheme(
    securityScheme: OpenAPIV3.SecuritySchemeObject
  ): Header | undefined {
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
        return this.createAuthHeader('Basic');
      case 'bearer':
        return this.createAuthHeader('Bearer');
      default:
        return this.parseApiKeyScheme(securityScheme);
    }
  }
}