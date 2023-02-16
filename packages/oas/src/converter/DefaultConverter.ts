import type { Converter } from './Converter';
import { BaseUrlParser, SubConverterRegistry } from './parts';
import { SubPart } from './SubPart';
import {
  SecurityRequirementsFactory,
  SecurityRequirementsParser
} from './security';
import type { PathItemObject } from '../types';
import { getOperation } from '../utils';
import $RefParser, { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import type {
  Header,
  OpenAPI,
  PostData,
  QueryString,
  Request
} from '@har-sdk/core';
import pointer from 'json-pointer';

export class DefaultConverter implements Converter {
  private spec: OpenAPI.Document;
  private securityRequirements?: SecurityRequirementsParser<OpenAPI.Document>;

  constructor(
    private readonly baseUrlParser: BaseUrlParser,
    private readonly subConverterRegistry: SubConverterRegistry,
    private readonly securityRequirementsFactory: SecurityRequirementsFactory
  ) {}

  public async convert(spec: OpenAPI.Document): Promise<Request[]> {
    this.spec = (await new $RefParser().dereference(
      JSON.parse(JSON.stringify(spec)) as JSONSchema,
      { resolve: { file: false, http: false } }
    )) as OpenAPI.Document;

    this.securityRequirements = this.securityRequirementsFactory.create(
      this.spec
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

    const request: Omit<Request, 'url'> = {
      queryString,
      method: method.toUpperCase(),
      headers: this.convertPart<Header[]>(SubPart.HEADERS, path, method),
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headersSize: 0,
      bodySize: 0,
      ...(postData ? { postData } : {})
    };

    this.authorizeRequest(path, method, request);

    return {
      ...request,
      url: this.buildUrl(path, method, queryString)
    };
  }

  private authorizeRequest(
    path: string,
    method: string,
    request: Omit<Request, 'url'>
  ): void {
    const operation = getOperation(this.spec, path, method);
    const claims = this.securityRequirements?.parse(operation) ?? [];
    claims.forEach((x) => x.authorizeRequest(request));
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
          .map((p) => [p.name, p.value].map(encodeURIComponent))
          .map(([name, value]: string[]) => `${name}=${value}`)
          .join('&')}`
      : '';
  }

  private convertPart<T>(type: SubPart, path: string, method: string): T {
    return this.subConverterRegistry
      .get(this.spec, type)
      .convert(path, method) as unknown as T;
  }
}
