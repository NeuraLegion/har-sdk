import { isOASV3 } from '../../utils';
import { SubConverter } from '../SubConverter';
import { SubPart } from '../SubPart';
import { Oas2HeadersConverter, Oas3HeadersConverter } from './headers';
import { Oas2PathConverter, Oas3PathConverter } from './path';
import { PostDataConverter } from './postdata';
import { Oas2QueryStringConverter, Oas3QueryStringConverter } from './query';
import { Sampler } from './Sampler';
import {
  Header,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3,
  QueryString
} from '@har-sdk/core';

export class SubConverterFactory {
  constructor(private readonly sampler: Sampler) {}

  public createSubConverter(
    spec: OpenAPI.Document,
    type: SubPart
  ): SubConverter<any> {
    switch (type) {
      case SubPart.HEADERS:
        return this.createHeadersConverter(spec);
      case SubPart.PATH:
        return this.createPathConverter(spec);
      case SubPart.POST_DATA:
        return new PostDataConverter(spec, this.sampler);
      case SubPart.QUERY_STRING:
        return this.createQueryStringConverter(spec);
      default:
        throw new TypeError(`${type} subconverter is not supported`);
    }
  }

  private createQueryStringConverter(
    spec: OpenAPI.Document
  ): SubConverter<QueryString[]> {
    return this.instantiate<Oas2QueryStringConverter, Oas3QueryStringConverter>(
      spec,
      Oas2QueryStringConverter,
      Oas3QueryStringConverter
    );
  }

  private createPathConverter(spec: OpenAPI.Document): SubConverter<string> {
    return this.instantiate<Oas2PathConverter, Oas3PathConverter>(
      spec,
      Oas2PathConverter,
      Oas3PathConverter
    );
  }

  private createHeadersConverter(
    spec: OpenAPI.Document
  ): SubConverter<Header[]> {
    return this.instantiate<Oas2HeadersConverter, Oas3HeadersConverter>(
      spec,
      Oas2HeadersConverter,
      Oas3HeadersConverter
    );
  }

  private instantiate<U, V>(
    spec: OpenAPI.Document,
    oas2Ctor: new (spec: OpenAPIV2.Document, sampler: Sampler) => U,
    oas3Ctor: new (spec: OpenAPIV3.Document, sampler: Sampler) => V
  ) {
    return isOASV3(spec)
      ? new oas3Ctor(spec as OpenAPIV3.Document, this.sampler)
      : new oas2Ctor(spec as OpenAPIV2.Document, this.sampler);
  }
}
