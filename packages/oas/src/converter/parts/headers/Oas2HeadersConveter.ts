import { LocationParam } from '../LocationParam';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { Sampler } from '../Sampler';
import { HeadersConverter } from './HeadersConverter';
import {
  Oas2SecurityRequirementsParser,
  SecurityRequirementsParser
} from '../security';
import { Header, OpenAPIV2 } from '@har-sdk/core';

export class Oas2HeadersConverter extends HeadersConverter<OpenAPIV2.Document> {
  private _security?: Oas2SecurityRequirementsParser;

  private readonly oas2ValueSerializer = new Oas2ValueSerializer();

  protected get security(): SecurityRequirementsParser<OpenAPIV2.Document> {
    if (!this._security) {
      this._security = new Oas2SecurityRequirementsParser(
        this.spec,
        this.sampler
      );
    }

    return this._security;
  }

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

  protected convertHeaderParam(
    headerParam: LocationParam<OpenAPIV2.Parameter>
  ): Header {
    return this.createHeader(
      headerParam.param.name,
      this.oas2ValueSerializer.serialize(headerParam) as string
    );
  }
}
