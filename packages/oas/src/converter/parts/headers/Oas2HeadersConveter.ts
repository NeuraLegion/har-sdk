import { Sampler } from '../Sampler';
import { HeadersConverter } from './HeadersConverter';
import { Header, OpenAPIV2 } from '@har-sdk/core';

export class Oas2HeadersConverter extends HeadersConverter<OpenAPIV2.Document> {
  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected createContentTypeHeaders(
    pathObj: OpenAPIV2.OperationObject
  ): Header[] {
    return this.createHeaders(
      'content-type',
      Array.isArray(pathObj.consumes) ? pathObj.consumes : []
    );
  }

  protected createAcceptHeaders(pathObj: OpenAPIV2.OperationObject): Header[] {
    return this.createHeaders(
      'accept',
      Array.isArray(pathObj.produces) ? pathObj.produces : []
    );
  }

  protected getSecuritySchemes():
    | Record<string, OpenAPIV2.SecuritySchemeObject>
    | undefined {
    return this.spec.securityDefinitions;
  }
}
