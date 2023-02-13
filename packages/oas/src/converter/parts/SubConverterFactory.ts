import { isOASV3 } from '../../utils';
import { SubConverter } from '../SubConverter';
import { SubPart } from '../SubPart';
import { Oas2HeadersConverter, Oas3HeadersConverter } from './headers';
import { Oas2PathConverter, Oas3PathConverter } from './path';
import { Oas2BodyConverter, Oas3RequestBodyConverter } from './postdata';
import { Oas2QueryStringConverter, Oas3QueryStringConverter } from './query';
import { Sampler } from './Sampler';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export class SubConverterFactory {
  constructor(private readonly sampler: Sampler) {}

  public createSubConverter(
    spec: OpenAPI.Document,
    type: SubPart
  ): SubConverter<unknown> {
    switch (type) {
      case SubPart.HEADERS:
        return this.instantiate(
          spec,
          Oas2HeadersConverter,
          Oas3HeadersConverter
        );
      case SubPart.PATH:
        return this.instantiate(spec, Oas2PathConverter, Oas3PathConverter);
      case SubPart.POST_DATA:
        return this.instantiate(
          spec,
          Oas2BodyConverter,
          Oas3RequestBodyConverter
        );
      case SubPart.QUERY_STRING:
        return this.instantiate(
          spec,
          Oas2QueryStringConverter,
          Oas3QueryStringConverter
        );
      default:
        throw new TypeError(`${type} subconverter is not supported`);
    }
  }

  private instantiate(
    spec: OpenAPI.Document,
    oas2Ctor: new (
      spec: OpenAPIV2.Document,
      sampler: Sampler
    ) => SubConverter<unknown>,
    oas3Ctor: new (
      spec: OpenAPIV3.Document,
      sampler: Sampler
    ) => SubConverter<unknown>
  ) {
    return isOASV3(spec)
      ? new oas3Ctor(spec as OpenAPIV3.Document, this.sampler)
      : new oas2Ctor(spec as OpenAPIV2.Document, this.sampler);
  }
}
