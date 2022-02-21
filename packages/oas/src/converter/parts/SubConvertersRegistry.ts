import { isOASV3 } from '../../utils';
import { SubConverter } from '../SubConverter';
import { SubPart } from '../SubPart';
import { Oas3HeadersConverter, Oas2HeadersConverter } from './headers';
import { Oas3PathConverter, Oas2PathConverter } from './path';
import { PostDataConverter } from './postdata';
import { Oas3QueryStringConverter, Oas2QueryStringConverter } from './query';
import { Sampler } from './Sampler';
import {
  Header,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3,
  QueryString
} from '@har-sdk/core';

export class SubConvertersRegistry {
  private readonly subConverters = new Map<SubPart, SubConverter<unknown>>();

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  public get(type: SubPart): SubConverter<unknown> {
    if (!this.subConverters.has(type)) {
      this.subConverters.set(type, this.createSubConverter(type));
    }

    return this.subConverters.get(type);
  }

  private createSubConverter(type: SubPart): SubConverter<any> {
    switch (type) {
      case SubPart.HEADERS:
        return this.createHeadersConverter();
      case SubPart.PATH:
        return this.createPathConverter();
      case SubPart.POST_DATA:
        return new PostDataConverter(this.spec, this.sampler);
      case SubPart.QUERY_STRING:
        return this.createQueryStringConverter();
      default:
        throw new TypeError(`${type} subconverter is not supported`);
    }
  }

  private createQueryStringConverter(): SubConverter<QueryString[]> {
    return this.instantiate<Oas2QueryStringConverter, Oas3QueryStringConverter>(
      Oas2QueryStringConverter,
      Oas3QueryStringConverter
    );
  }

  private createPathConverter(): SubConverter<string> {
    return this.instantiate<Oas2PathConverter, Oas3PathConverter>(
      Oas2PathConverter,
      Oas3PathConverter
    );
  }

  private createHeadersConverter(): SubConverter<Header[]> {
    return this.instantiate<Oas2HeadersConverter, Oas3HeadersConverter>(
      Oas2HeadersConverter,
      Oas3HeadersConverter
    );
  }

  private instantiate<U, V>(
    oas2Ctor: new (spec: OpenAPIV2.Document, sampler: Sampler) => U,
    oas3Ctor: new (spec: OpenAPIV3.Document, sampler: Sampler) => V
  ) {
    return isOASV3(this.spec)
      ? new oas3Ctor(this.spec as OpenAPIV3.Document, this.sampler)
      : new oas2Ctor(this.spec as OpenAPIV2.Document, this.sampler);
  }
}
