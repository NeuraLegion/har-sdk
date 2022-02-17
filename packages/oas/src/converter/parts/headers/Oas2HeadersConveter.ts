import { isObject } from '../../../utils';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { Sampler } from '../Sampler';
import { HeadersConverter } from './HeadersConverter';
import { Header, OpenAPIV2 } from '@har-sdk/core';

export class Oas2HeadersConverter extends HeadersConverter<OpenAPIV2.Document> {
  private readonly oas2ValueSerializer = new Oas2ValueSerializer();

  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected createContentTypeHeaders(
    pathObj: OpenAPIV2.OperationObject
  ): Header[] {
    return this.createHeaders('content-type', pathObj.consumes);
  }

  protected createAcceptHeaders(pathObj: OpenAPIV2.OperationObject): Header[] {
    return this.createHeaders('accept', pathObj.produces);
  }

  // TODO proper logic
  protected convertHeaderParam(
    param: OpenAPIV2.Parameter,
    paramValue: unknown
  ): Header {
    const value = this.oas2ValueSerializer.serialize(param, paramValue);

    return {
      name: param.name,
      value: isObject(value) ? JSON.stringify(value) : (value as string)
    };
  }

  protected getSecuritySchemes():
    | Record<string, OpenAPIV2.SecuritySchemeObject>
    | undefined {
    return this.spec.securityDefinitions;
  }
}
