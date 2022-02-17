import { isOASV3 } from '../utils';
import { Converter } from './Converter';
import {
  BaseUrlParser,
  Oas2PathConverter,
  Oas2QueryStringConverter,
  Oas3PathConverter,
  Oas3QueryStringConverter,
  PostDataConverter,
  Sampler,
  Oas3HeadersConverter,
  Oas2HeadersConverter
} from './parts';
import { SubPart } from './SubPart';
import { SubConverter } from './SubConverter';
import $RefParser, { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import {
  Header,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3,
  PostData,
  QueryString,
  Request
} from '@har-sdk/core';
import pointer from 'json-pointer';

type PathItemObject = OpenAPIV2.PathItemObject | OpenAPIV3.PathItemObject;

export class DefaultConverter implements Converter {
  private readonly sampler = new Sampler();
  private readonly baseUrlConverter = new BaseUrlParser(this.sampler);

  private spec: OpenAPI.Document;
  private baseUrl: string;
  private subConverters: Map<SubPart, SubConverter<any>>;

  public async convert(spec: OpenAPI.Document): Promise<Request[]> {
    this.spec = (await new $RefParser().dereference(
      JSON.parse(JSON.stringify(spec)) as JSONSchema,
      { resolve: { file: false, http: false } }
    )) as OpenAPI.Document;

    this.baseUrl = this.baseUrlConverter.parse(this.spec);
    this.subConverters = new Map<SubPart, SubConverter<any>>(
      Object.values(SubPart).map((type) => [
        type,
        this.createConverter(type, this.spec)
      ])
    );

    return Object.entries(this.spec.paths).flatMap(
      ([path, pathMethods]: [string, PathItemObject]) =>
        Object.keys(pathMethods)
          .filter(
            (method: string) =>
              !method.toLowerCase().startsWith('x-swagger-router-controller')
          )
          .map((method) => this.createHarEntry(path, method))
    );
  }

  private createHarEntry(path: string, method: string): Request {
    const queryString = this.convertPart<QueryString[]>(
      SubPart.QUERY_STRING,
      path,
      method
    );

    const postData = this.convertPart<PostData>(
      SubPart.POST_DATA,
      path,
      method
    );

    return {
      queryString,
      url: this.buildUrl(path, method, queryString),
      method: method.toUpperCase(),
      headers: this.convertPart<Header[]>(SubPart.HEADERS, path, method),
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headersSize: 0,
      bodySize: 0,
      ...(postData ? { postData } : {})
    };
  }

  private buildUrl(
    path: string,
    method: string,
    queryString: QueryString[]
  ): string {
    const rawUrl = `${this.baseUrl}${this.convertPart(
      SubPart.PATH,
      path,
      method
    )}${this.serializeQueryString(queryString)}`;

    return this.baseUrlConverter.normalizeUrl(rawUrl, {
      jsonPointer: pointer.compile(['paths', path, method])
    });
  }

  private serializeQueryString(items: QueryString[]): string {
    return items.length
      ? `?${items
          .map((p) => Object.values(p).map((x) => encodeURIComponent(x)))
          .map(([name, value]: string[]) => `${name}=${value}`)
          .join('&')}`
      : '';
  }

  private createSubConverter(
    type: SubPart,
    spec: OpenAPI.Document
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
    }
  }

  private createQueryStringConverter(
    spec: OpenAPI.Document
  ): SubConverter<QueryString[]> {
    return isOASV3(spec)
      ? new Oas3QueryStringConverter(spec, this.sampler)
      : new Oas2QueryStringConverter(spec, this.sampler);
  }

  private createPathConverter(spec: OpenAPI.Document): SubConverter<string> {
    return isOASV3(spec)
      ? new Oas3PathConverter(spec, this.sampler)
      : new Oas2PathConverter(spec, this.sampler);
  }

  private createHeadersConverter(
    spec: OpenAPI.Document
  ): SubConverter<Header[]> {
    return isOASV3(spec)
      ? new Oas3HeadersConverter(spec, this.sampler)
      : new Oas2HeadersConverter(spec, this.sampler);
  }

  private convertPart<T>(type: SubPart, path: string, method: string): T {
    return this.subConverters.get(type).convert(path, method) as unknown as T;
  }
}
