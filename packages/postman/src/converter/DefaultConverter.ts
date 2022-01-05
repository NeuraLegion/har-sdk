import { Converter } from './Converter';
import { VariableParser, VariableParserFactory } from '../parser';
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

  constructor(
    private readonly parserFactory: VariableParserFactory,
    options: {
      environment?: Record<string, string>;
    }
  ) {
    this.variables = Object.entries(options?.environment ?? {}).map(
      ([key, value]: [string, string]) => ({
        key,
        value
      })
    );
  }

  public async convert(collection: Postman.Document): Promise<Request[]> {
    return this.traverse(collection, [...this.variables]);
  }

  private traverse(
    folder: Postman.ItemGroup,
    variables: Postman.Variable[]
  ): Request[] {
    variables = [...(folder?.variable ?? []), ...variables];

    return folder.item.reduce(
      (items: Request[], x: Postman.ItemGroup | Postman.Item) => {
        const subVariables = [...(x?.variable ?? []), ...variables];

        if (this.isGroup(x)) {
          return items.concat(this.traverse(x, subVariables));
        }

        const request: Request | undefined = this.convertRequest(
          x,
          subVariables
        );

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
    variables: Postman.Variable[]
  ): Request | undefined {
    if (item.request) {
      const { method, header, body, auth, url: urlObject } = item.request;

      if (!method) {
        throw new Error('Method is not defined.');
      }

      const url: string = this.convertUrl(urlObject, variables);

      const request: Request = {
        url,
        method: (method ?? 'GET').toUpperCase(),
        headers: this.convertHeaders(header ?? '', variables),
        queryString: this.convertQuery(url, variables),
        cookies: [],
        postData: body && this.convertBody(body, variables),
        headersSize: -1,
        bodySize: -1,
        httpVersion: 'HTTP/1.1'
      };

      if (auth) {
        this.authRequest(request, auth, variables);
      }

      return request;
    }
  }

  private authRequest(
    request: Request,
    auth: Postman.RequestAuth,
    variables: Postman.Variable[]
  ): void {
    const params: Postman.Variable[] | undefined = auth[auth.type];

    if (!params) {
      return;
    }

    const options = Object.fromEntries(
      params.map((val: Postman.Variable) => [val.key, val.value].map(String))
    );

    switch (auth.type) {
      case 'apikey':
        this.apiKeyAuth(request, options, variables);
        break;
      case 'basic':
        this.basicAuth(request, options, variables);
        break;
      case 'bearer':
        this.bearerAuth(request, options, variables);
        break;
      case 'oauth2':
        this.oauth2(request, options, variables);
        break;
      case 'noauth':
      default:
        break;
    }
  }

  private oauth2(
    request: Request,
    options: Record<string, string>,
    variables: Postman.Variable[]
  ) {
    if (!options.accessToken || options.tokenType === 'mac') {
      return;
    }

    const target: AuthLocation =
      AuthLocation[(options.addTokenTo ?? 'header').toUpperCase()];
    const parser = this.parserFactory.createEnvVariableParser(variables);

    this.removeCredentials(request, target);

    switch (target) {
      case AuthLocation.QUERY: {
        request.queryString.push({
          name: 'access_token',
          value: parser.parse(options.accessToken)
        });
        break;
      }
      case AuthLocation.HEADER: {
        const prefix: string = !options.headerPrefix
          ? 'Bearer '
          : options.headerPrefix;

        request.headers.push({
          name: 'authorization',
          value: `${prefix.trim()} ${parser.parse(options.accessToken)}`
        });
        break;
      }
    }
  }

  private bearerAuth(
    request: Request,
    options: Record<string, string>,
    variables: Postman.Variable[]
  ): void {
    const parser = this.parserFactory.createEnvVariableParser(variables);

    this.removeCredentials(request, AuthLocation.HEADER);

    const value = `Bearer ${parser
      .parse(options.token)
      .replace(/^Bearer/, '')
      .trim()}`;

    request.headers.push({
      value,
      name: 'authorization'
    });
  }

  private removeCredentials(request: Request, from: AuthLocation): void {
    const idx: number = request[from].findIndex((x: Header) =>
      ['access_token', 'authorization'].includes(x.name.toLowerCase().trim())
    );

    if (idx !== -1) {
      request[from].splice(idx, 1);
    }
  }

  private basicAuth(
    request: Request,
    options: Record<string, string>,
    variables: Postman.Variable[]
  ) {
    const parser = this.parserFactory.createEnvVariableParser(variables);

    this.removeCredentials(request, AuthLocation.HEADER);

    const value = `Basic ${Buffer.from(
      `${parser.parse(options.username)}:${parser.parse(options.password)}`,
      'utf8'
    ).toString('base64')}`;

    request.headers.push({
      value,
      name: 'authorization'
    });
  }

  private apiKeyAuth(
    request: Request,
    options: Record<string, string>,
    variables: Postman.Variable[]
  ): void {
    const parser = this.parserFactory.createEnvVariableParser(variables);
    const target: AuthLocation =
      AuthLocation[(options.in ?? 'header').toUpperCase()];

    this.removeCredentials(request, target);

    request[target].push({
      name: parser.parse(options.key),
      value: parser.parse(options.value)
    });
  }

  private convertBody(
    body: Postman.RequestBody,
    variables: Postman.Variable[]
  ): PostData {
    const parser: VariableParser =
      this.parserFactory.createEnvVariableParser(variables);

    switch (body.mode) {
      case 'raw':
        return this.rawBody(body, parser);
      case 'urlencoded':
        return this.urlencoded(body, parser);
      case 'formdata':
        return this.formData(body, parser);
      case 'file':
        return this.file(body);
      case 'graphql':
        return this.graphql(body, parser);
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

  private graphql(body: Postman.RequestBody, parser: VariableParser): PostData {
    const { query, variables } = body.graphql ?? {};

    return {
      mimeType: 'application/json',
      text: JSON.stringify({ query, variables: parser.parse(variables) })
    };
  }

  private formData(
    body: Postman.RequestBody,
    parser: VariableParser
  ): PostData {
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
              x.contentType ?? (lookup(extension ?? '') || undefined);

            return {
              fileName,
              contentType,
              name: parser.parse(x.key),
              value: parser.parse(x.value ?? '')
            };
          })
        : []
    };
  }

  private urlencoded(
    body: Postman.RequestBody,
    parser: VariableParser
  ): PostData {
    let params: { name: string; value: string | undefined }[];

    if (Array.isArray(body.urlencoded)) {
      params = body.urlencoded.map((x: Postman.QueryParam) => ({
        name: parser.parse(x.key),
        value: parser.parse(x.value ?? '')
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
                parser.parse(x.key),
                parser.parse(x.value ?? '')
              ])
            )
          );

    return {
      text,
      params,
      mimeType: 'application/x-www-form-urlencoded'
    } as unknown as PostData;
  }

  private rawBody(body: Postman.RequestBody, parser: VariableParser): PostData {
    return {
      mimeType: this.getMimetype(body.options?.raw?.language ?? 'json'),
      text: parser.parse(body.raw ?? '')
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

  private convertHeaders(
    headers: Postman.Header[] | string,
    variables: Postman.Variable[]
  ): Header[] {
    const parser: VariableParser =
      this.parserFactory.createEnvVariableParser(variables);

    if (Array.isArray(headers)) {
      return headers.map((x: Postman.Header) => ({
        name: x.key,
        value: parser.parse(x.value ?? '')
      }));
    }

    return headers.split('\n').map((pair: string) => {
      const [name, value]: string[] = pair
        .split(':')
        .map((x: string) => x.trim());

      return {
        name,
        value: parser.parse(value ?? '')
      };
    });
  }

  private convertUrl(
    value: Postman.Url | string,
    variables: Postman.Variable[]
  ): string {
    const subVariables = typeof value === 'string' ? [] : value.variable;
    const envParser: VariableParser =
      this.parserFactory.createEnvVariableParser([
        ...(subVariables ?? []),
        ...variables
      ]);

    if (typeof value === 'string') {
      return envParser.parse(value);
    }

    let urlString: string = decodeURI(this.buildUrlString(value, envParser));

    urlString = envParser.parse(urlString);

    return normalizeUrl(encodeURI(urlString));
  }

  private buildUrlString(url: Postman.Url, env: VariableParser): string {
    const { host, protocol } = url;

    const p = protocol ? env.parse(protocol).replace(/:?$/, ':') : '';
    const u = parseUrl(normalizeUrl(`${p}//${this.buildHost(host, env)}`));

    if (url.port) {
      u.port = url.port;
    }

    if (url.hash) {
      u.hash = url.hash;
    }

    const pathname = this.buildPathname(url);
    if (pathname) {
      u.pathname = env.parse(pathname);
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

  private buildHost(host: string | string[], env: VariableParser): string {
    if (!host || !host.length) {
      throw new Error('Host is not defined.');
    }

    host = env.parse(Array.isArray(host) ? host.join('.') : host);

    try {
      return parseUrl(host).host;
    } catch {
      return host;
    }
  }

  private buildPathname(url: Postman.Url): string {
    const parser = this.parserFactory.createUrlVariableParser(url.variable);

    return Array.isArray(url.path)
      ? url.path
          .map((x: string | Postman.Variable) =>
            parser.parse(typeof x === 'string' ? x : x.value ?? '')
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

  private convertQuery(
    url: Postman.Url | string,
    variables: Postman.Variable[]
  ): QueryString[] {
    let query: Record<string, undefined | string | string[]> | undefined;

    if (typeof url === 'string') {
      query = Object.fromEntries(parseUrl(url).searchParams);
    } else {
      query = this.prepareQueries(url);
    }

    if (!query) {
      return [];
    }

    const envParser: VariableParser =
      this.parserFactory.createEnvVariableParser(variables);

    return Object.entries(query).map(
      ([name, value]: [string, undefined | string | string[]]) => ({
        name,
        value: envParser.parse(
          (Array.isArray(value) ? value.join(',') : value) ?? ''
        )
      })
    );
  }
}
