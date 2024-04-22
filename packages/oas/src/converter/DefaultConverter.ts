import type { Converter } from './Converter';
import { BaseUrlParser, SubConverterRegistry } from './parts';
import { SubPart } from './SubPart';
import {
  SecurityRequirementsFactory,
  SecurityRequirementsParser
} from './security';
import type { PathItemObject } from '../types';
import { getOperation, isOASV2 } from '../utils';
import $RefParser, { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import type {
  Cookie,
  Header,
  OpenAPI,
  PostData,
  QueryString,
  Request
} from '@har-sdk/core';
import pointer from 'json-pointer';

export class DefaultConverter implements Converter {
  private readonly ALLOWED_METHODS: readonly string[] = [
    'GET',
    'PUT',
    'POST',
    'DELETE',
    'OPTIONS',
    'HEAD',
    'PATCH',
    'TRACE'
  ];

  private spec: OpenAPI.Document;
  private securityRequirements?: SecurityRequirementsParser<OpenAPI.Document>;
  private readonly refParser = new $RefParser();

  constructor(
    private readonly baseUrlParser: BaseUrlParser,
    private readonly subConverterRegistry: SubConverterRegistry,
    private readonly securityRequirementsFactory: SecurityRequirementsFactory
  ) {}

  public async convert(spec: OpenAPI.Document): Promise<Request[]> {
    this.spec = await this.normalizeSpec(spec);

    this.securityRequirements = this.securityRequirementsFactory.create(
      this.spec
    );

    return Object.entries(this.spec.paths).flatMap(
      ([path, pathMethods]: [string, PathItemObject]) =>
        Object.keys(pathMethods)
          .filter(
            (method: string) =>
                this.ALLOWED_METHODS.includes(method.toUpperCase())
          )
          .map((method) => this.createHarEntry(path, method))
    );
  }

  private async normalizeSpec(
    spec: OpenAPI.Document
  ): Promise<OpenAPI.Document> {
    const copy: OpenAPI.Document = JSON.parse(JSON.stringify(spec));
    const schemas = isOASV2(copy) ? copy.definitions : copy.components?.schemas;
    // ADHOC: requires the schema name be identical to the model name rather than using the 'root' name.
    // For details please refer to the documentation at https://swagger.io/docs/specification/data-models/representing-xml/
    for (const [name, schema] of Object.entries(schemas ?? {})) {
      if ('$ref' in schema) {
        continue;
      }

      schema.xml ??= {};
      schema.xml.name ??= name;
    }

    return (await this.refParser.dereference(copy as JSONSchema, {
      resolve: { file: false, http: false }
    })) as OpenAPI.Document;
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
    const cookies = this.convertPart<Cookie[]>(SubPart.COOKIES, path, method);
    const headers = this.convertPart<Header[]>(SubPart.HEADERS, path, method);

    const request: Omit<Request, 'url'> = {
      queryString,
      cookies,
      method: method.toUpperCase(),
      headers: this.enrichHeadersWithCookies(headers, cookies),
      httpVersion: 'HTTP/1.1',
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

  private enrichHeadersWithCookies(
    headers: Header[],
    cookies: Cookie[]
  ): Header[] {
    return [
      ...headers,
      ...cookies.map((cookie) => ({
        name: 'cookie',
        value: `${cookie.name}=${cookie.value}`
      }))
    ];
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
