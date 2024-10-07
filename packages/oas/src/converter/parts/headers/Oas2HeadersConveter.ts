import { ConverterOptions } from '../../Converter';
import { LocationParam } from '../LocationParam';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { Sampler } from '../../Sampler';
import { HeadersConverter } from './HeadersConverter';
import { Oas2MediaTypesResolver } from '../Oas2MediaTypesResolver';
import { Header, OpenAPIV2 } from '@har-sdk/core';

export class Oas2HeadersConverter extends HeadersConverter<OpenAPIV2.Document> {
  private readonly oas2ValueSerializer = new Oas2ValueSerializer();
  private readonly oas2MediaTypeResolver: Oas2MediaTypesResolver;

  constructor(
    spec: OpenAPIV2.Document,
    sampler: Sampler,
    options: ConverterOptions
  ) {
    super(spec, sampler, options);
    this.oas2MediaTypeResolver = new Oas2MediaTypesResolver(spec);
  }

  protected createContentTypeHeaders(
    operation: OpenAPIV2.OperationObject
  ): Header[] {
    return this.createHeaders(
      'content-type',
      this.oas2MediaTypeResolver.resolveToConsume(operation)
    );
  }

  protected createAcceptHeaders(
    operation: OpenAPIV2.OperationObject
  ): Header[] {
    return this.createHeaders(
      'accept',
      this.oas2MediaTypeResolver.resolveToProduce(operation)
    );
  }

  protected convertHeaderParam(
    headerParam: LocationParam<OpenAPIV2.Parameter>
  ): Header {
    return this.createHeader(
      headerParam.param.name,
      `${this.oas2ValueSerializer.serialize(headerParam)}`
    );
  }
}
