import { Converter } from './Converter';
import { LexicalScope } from '../parser';
import { VariableResolver } from './VariableResolver';
import { ConverterOptions } from './ConverterOptions';
import {
  Header,
  normalizeUrl,
  parseUrl,
  PostData,
  Postman,
  QueryString,
  Request
} from '@har-sdk/core';
import { lookup } from 'mime-types';
import { parse, stringify } from 'qs';
import { basename, extname } from 'path';

export enum AuthLocation {
  QUERY = 'queryString',
  HEADER = 'headers'
}

export class DefaultConverter implements Converter {
  private readonly variables: ReadonlyArray<Postman.Variable>;
  private readonly dryRun: boolean;

  constructor(
    private readonly variableResolver: VariableResolver,
    options: ConverterOptions = {}
  ) {
    this.variables = Object.entries(options.environment ?? {}).map(
      ([key, value]: [string, string]) => ({
        key,
        value
      })
    );
    this.dryRun = !!options.dryRun;
  }

  public async convert(collection: Postman.Document): Promise<Request[]> {
    const scope = new LexicalScope('', [...this.variables]);

    return this.traverse(collection, scope);
  }

  private traverse(folder: Postman.ItemGroup, scope: LexicalScope): Request[] {
    scope.combine(folder.variable ?? []);

    return folder.item.reduce(
      (items: Request[], x: Postman.ItemGroup | Postman.Item, idx: number) => {
        const subScope = scope.concat(
          `/item/${idx.toString(10)}`,
          x.variable ?? []
        );

        if (this.isGroup(x)) {
          return items.concat(this.traverse(x, subScope));
        }

        const request: Request | undefined = this.convertRequest(x, subScope);

        if (request) {
          items.push(request);
        }

        return items;
      },
      []
    );
  }

  private isGroup(x: any): x is Postman.ItemGroup {
    return Array.isArray(x.item);
  }

  private convertRequest(
    item: Postman.Item,
    scope: LexicalScope
  ): Request | undefined {
    if (item.request) {
      const {
        method,
        header,
        body,
        auth,
        url: urlObject
      } = this.variableResolver.resolve(item.request, scope);

      if (!method) {
        throw new Error('Method is not defined.');
      }

      const url = this.convertUrl(urlObject);
      const request: Request = {
        url,
        method: method.toUpperCase(),
        headers: this.convertHeaders(header ?? ''),
        queryString: this.convertQuery(url),
        cookies: [],
        postData: body && this.convertBody(body),
        headersSize: -1,
        bodySize: -1,
        httpVersion: 'HTTP/1.1'
      };

      if (auth) {
        this.authRequest(request, auth);
      }

      return request;
    }
  }

  /* istanbul ignore next */
  private authRequest(request: Request, auth: Postman.RequestAuth): void {
    const params: Postman.Variable[] | undefined = auth[auth.type];

    if (!params) {
      return;
    }

    const options = Object.fromEntries(
      params.map((val: Postman.Variable) => [val.key, val.value].map(String))
    );

    switch (auth.type) {
      case 'apikey':
        this.apiKeyAuth(request, options);
        break;
      case 'basic':
        this.basicAuth(request, options);
        break;
      case 'bearer':
        this.bearerAuth(request, options);
        break;
      case 'oauth2':
        this.oauth2(request, options);
        break;
      case 'noauth':
      default:
        break;
    }
  }

  /* istanbul ignore next */
  private oauth2(request: Request, options: Record<string, string>): void {
    if (!options.accessToken || options.tokenType === 'mac') {
      return;
    }

    const target: AuthLocation =
      AuthLocation[(options.addTokenTo ?? 'header').toUpperCase()];

    this.removeCredentials(request, target);

    switch (target) {
      case AuthLocation.QUERY: {
        request.queryString.push({
          name: 'access_token',
          value: options.accessToken
        });
        break;
      }
      case AuthLocation.HEADER: {
        const prefix: string = !options.headerPrefix
          ? 'Bearer '
          : options.headerPrefix;

        request.headers.push({
          name: 'authorization',
          value: `${prefix.trim()} ${options.accessToken}`
        });
        break;
      }
    }
  }

  /* istanbul ignore next */
  private bearerAuth(request: Request, options: Record<string, string>): void {
    this.removeCredentials(request, AuthLocation.HEADER);

    const value = `Bearer ${options.token.replace(/^Bearer/, '').trim()}`;

    request.headers.push({
      value,
      name: 'authorization'
    });
  }

  /* istanbul ignore next */
  private removeCredentials(request: Request, from: AuthLocation): void {
    const idx: number = request[from].findIndex((x: Header) =>
      ['access_token', 'authorization'].includes(x.name.toLowerCase().trim())
    );

    if (idx !== -1) {
      request[from].splice(idx, 1);
    }
  }

  /* istanbul ignore next */
  private basicAuth(request: Request, options: Record<string, string>): void {
    this.removeCredentials(request, AuthLocation.HEADER);

    const value = `Basic ${Buffer.from(
      `${options.username}:${options.password}`,
      'utf8'
    ).toString('base64')}`;

    request.headers.push({
      value,
      name: 'authorization'
    });
  }

  /* istanbul ignore next */
  private apiKeyAuth(request: Request, options: Record<string, string>): void {
    const target: AuthLocation =
      AuthLocation[(options.in ?? 'header').toUpperCase()];

    this.removeCredentials(request, target);

    request[target].push({
      name: options.key,
      value: options.value
    });
  }

  private convertBody(body: Postman.RequestBody): PostData {
    switch (body.mode) {
      case 'raw':
        return this.rawBody(body);
      case 'urlencoded':
        return this.urlencoded(body);
      case 'formdata':
        return this.formData(body);
      case 'file':
        return this.file(body);
      case 'graphql':
        return this.graphql(body);
      default:
        throw new Error('"mode" is not supported.');
    }
  }

  private file(body: Postman.RequestBody): PostData {
    return {
      mimeType: 'application/octet-stream',
      text:
        (typeof body.file === 'string' ? body.file : body.file?.content) ?? ''
    };
  }

  private graphql(body: Postman.RequestBody): PostData {
    const { query, variables } = body.graphql ?? {};

    return {
      mimeType: 'application/json',
      text: JSON.stringify({ query, variables })
    };
  }

  private formData(body: Postman.RequestBody): PostData {
    return {
      mimeType: 'multipart/form-data',
      params: Array.isArray(body.formdata)
        ? body.formdata.map((x: Postman.FormParam) => {
            const fileName: string | undefined = x.src
              ? basename(Array.isArray(x.src) ? x.src.pop() ?? '' : x.src)
              : undefined;

            const extension: string | undefined = fileName
              ? extname(fileName)
              : fileName;

            const contentType: string | undefined =
              x.contentType ??
              (this.dryRun ? undefined : lookup(extension ?? '') || undefined);

            return {
              fileName,
              contentType,
              name: x.key,
              value: x.value ?? ''
            };
          })
        : []
    };
  }

  private urlencoded(body: Postman.RequestBody): PostData {
    let params: { name: string; value: string | undefined }[];

    if (Array.isArray(body.urlencoded)) {
      params = body.urlencoded.map((x: Postman.QueryParam) => ({
        name: x.key,
        value: x.value ?? ''
      }));
    } else {
      params = Object.entries(
        parse(body.urlencoded ?? '') as Record<
          string,
          undefined | string | string[]
        >
      ).map(
        // eslint-disable-next-line @typescript-eslint/typedef
        ([name, value]) => ({
          name,
          value: Array.isArray(value) ? value.join('&') : value
        })
      );
    }

    const text: string =
      typeof body.urlencoded === 'string'
        ? body.urlencoded
        : stringify(
            Object.fromEntries(
              (body.urlencoded ?? []).map((x: Postman.QueryParam) => [
                x.key,
                x.value ?? ''
              ])
            )
          );

    return {
      text,
      params,
      mimeType: 'application/x-www-form-urlencoded'
    } as unknown as PostData;
  }

  private rawBody(body: Postman.RequestBody): PostData {
    return {
      mimeType: this.getMimetype(body.options?.raw?.language ?? 'json'),
      text: body.raw ?? ''
    };
  }

  private getMimetype(
    lang: 'json' | 'text' | 'javascript' | 'html' | 'xml' | string
  ): string {
    switch (lang) {
      case 'json':
        return 'application/json';
      case 'javascript':
      case 'js':
        return 'application/javascript';
      case 'html':
        return 'text/html';
      case 'xml':
        return 'application/xml';
      case 'text':
      default:
        return 'text/plain';
    }
  }

  private convertHeaders(headers: Postman.Header[] | string): Header[] {
    if (Array.isArray(headers)) {
      return headers.map((x: Postman.Header) => ({
        name: x.key,
        value: x.value ?? ''
      }));
    }

    return headers.split('\n').map((pair: string) => {
      const [name, value]: string[] = pair
        .split(':')
        .map((x: string) => x.trim());

      return {
        name,
        value: value ?? ''
      };
    });
  }

  private convertUrl(value: Postman.Url | string): string {
    return typeof value !== 'string'
      ? normalizeUrl(this.buildUrlString(value))
      : value;
  }

  private buildUrlString(url: Postman.Url): string {
    const { host, protocol } = url;

    const p = protocol ? protocol.replace(/:?$/, ':') : '';
    const u = parseUrl(normalizeUrl(`${p}//${this.buildHost(host)}`));

    if (url.port) {
      u.port = url.port;
    }

    if (url.hash) {
      u.hash = url.hash;
    }

    const pathname = this.buildPathname(url);

    if (pathname) {
      u.pathname = pathname;
    }

    u.search = stringify(this.prepareQueries(url) ?? {}, {
      format: 'RFC3986',
      encode: false,
      addQueryPrefix: true
    });

    u.username = url.auth?.user ?? '';
    u.password = url.auth?.password ?? '';

    return u.toString();
  }

  private buildHost(host: string | string[]): string {
    if (!host || !host.length) {
      throw new Error('Host is not defined.');
    }

    host = Array.isArray(host) ? host.join('.') : host;

    try {
      return parseUrl(host).host;
    } catch {
      return host;
    }
  }

  private buildPathname(url: Postman.Url): string {
    return Array.isArray(url.path)
      ? url.path
          .map((x: string | Postman.Variable) =>
            typeof x === 'string' ? x : x.value ?? ''
          )
          .join('/')
      : url.path;
  }

  private prepareQueries(
    url: Postman.Url
  ): Record<string, undefined | string | string[]> | undefined {
    return Array.isArray(url.query)
      ? Object.fromEntries(
          url.query.map((x: Postman.QueryParam) => [
            x.key.trim(),
            x.value ?? ''
          ])
        )
      : undefined;
  }

  private convertQuery(url: Postman.Url | string): QueryString[] {
    const query: Record<string, undefined | string | string[]> | undefined =
      typeof url === 'string'
        ? Object.fromEntries(parseUrl(url).searchParams)
        : this.prepareQueries(url);

    if (!query) {
      return [];
    }

    return Object.entries(query).map(
      ([name, value]: [string, undefined | string | string[]]) => ({
        name,
        value: (Array.isArray(value) ? value.join(',') : value) ?? ''
      })
    );
  }
}
