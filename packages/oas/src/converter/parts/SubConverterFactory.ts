import { isOASV3 } from '../../utils';
import { SubConverter } from '../SubConverter';
import { SubPart } from '../SubPart';
import { Oas2HeadersConverter, Oas3HeadersConverter } from './headers';
import { Oas2PathConverter, Oas3PathConverter } from './path';
import { Oas2BodyConverter, Oas3RequestBodyConverter } from './postdata';
import { Oas2QueryStringConverter, Oas3QueryStringConverter } from './query';
import { Sampler } from '../Sampler';
import { Oas2CookiesConverter, Oas3CookiesConverter } from './cookies';
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
      case SubPart.COOKIES:
        return this.instantiate(
          spec,
          Oas2CookiesConverter,
          Oas3CookiesConverter
        );
      default:
        this.throwIfParamIsNoSupported(type, spec);
    }
  }

  private throwIfParamIsNoSupported(
    type: never,
    spec: OpenAPI.Document
  ): never {
    throw new TypeError(
      `${type} parameters is not supported for OpenAPI ${
        isOASV3(spec) ? '3' : '2'
      }`
    );
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
