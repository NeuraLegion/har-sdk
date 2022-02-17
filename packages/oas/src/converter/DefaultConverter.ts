import { Converter } from './Converter';
import { BaseUrlParser, Sampler, SubConvertersFactory } from './parts';
import { SubPart } from './SubPart';
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
  private readonly baseUrlParser = new BaseUrlParser(this.sampler);

  private spec: OpenAPI.Document;
  private subConvertersFactory: SubConvertersFactory;

  public async convert(spec: OpenAPI.Document): Promise<Request[]> {
    this.spec = (await new $RefParser().dereference(
      JSON.parse(JSON.stringify(spec)) as JSONSchema,
      { resolve: { file: false, http: false } }
    )) as OpenAPI.Document;

    this.subConvertersFactory = new SubConvertersFactory(
      this.spec,
      this.sampler
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
    const rawUrl = `${this.baseUrlParser.parse(this.spec)}${this.convertPart(
      SubPart.PATH,
      path,
      method
    )}${this.serializeQueryString(queryString)}`;

    return this.baseUrlParser.normalizeUrl(rawUrl, {
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

  private convertPart<T>(type: SubPart, path: string, method: string): T {
    return this.subConvertersFactory
      .get(type)
      .convert(path, method) as unknown as T;
  }
}
