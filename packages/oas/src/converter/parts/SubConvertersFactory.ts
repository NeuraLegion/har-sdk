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

export class SubConvertersFactory {
  private subConverters = new Map<SubPart, SubConverter<unknown>>();

  private readonly oas3: boolean;

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {
    this.oas3 = isOASV3(this.spec);
  }

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
    }
  }

  private createQueryStringConverter(): SubConverter<QueryString[]> {
    return this.oas3
      ? new Oas3QueryStringConverter(
          this.spec as OpenAPIV3.Document,
          this.sampler
        )
      : new Oas2QueryStringConverter(
          this.spec as OpenAPIV2.Document,
          this.sampler
        );
  }

  private createPathConverter(): SubConverter<string> {
    return this.oas3
      ? new Oas3PathConverter(this.spec as OpenAPIV3.Document, this.sampler)
      : new Oas2PathConverter(this.spec as OpenAPIV2.Document, this.sampler);
  }

  private createHeadersConverter(): SubConverter<Header[]> {
    return this.oas3
      ? new Oas3HeadersConverter(this.spec as OpenAPIV3.Document, this.sampler)
      : new Oas2HeadersConverter(this.spec as OpenAPIV2.Document, this.sampler);
  }
}
