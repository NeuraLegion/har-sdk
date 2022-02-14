/* eslint-disable max-depth */
import { Converter } from './Converter';
import { Flattener, isObject } from '../utils';
import { ConvertError } from '../errors';
import $RefParser, { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import {
  Header,
  normalizeUrl,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3,
  PostData,
  QueryString,
  removeLeadingSlash,
  removeTrailingSlash,
  Request
} from '@har-sdk/core';
import { sample, Schema } from '@har-sdk/openapi-sampler';
import { toXML } from 'jstoxml';
import { stringify } from 'qs';
import template from 'url-template';
import pointer from 'json-pointer';

interface HarRequest {
  readonly method: string;
  readonly url: string;
  readonly description: string;
  readonly har: Request;
}

export class DefaultConverter implements Converter {
  private readonly JPG_IMAGE = '/9j/2w==';
  private readonly PNG_IMAGE = 'iVBORw0KGgo=';
  private readonly BOUNDARY = '956888039105887155673143';
  private readonly BASE64_PATTERN =
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  private readonly flattener = new Flattener();

  public async convert(spec: OpenAPI.Document): Promise<Request[]> {
    const dereferenceSpec = (await new $RefParser().dereference(
      JSON.parse(JSON.stringify(spec)) as JSONSchema,
      { resolve: { file: false, http: false } }
    )) as OpenAPI.Document;

    const baseUrl = this.getBaseUrl(dereferenceSpec);
    const requests: HarRequest[] = this.parseSwaggerDoc(
      dereferenceSpec,
      baseUrl
    );

    return requests.map((x: HarRequest) => x.har);
  }

  private parseSwaggerDoc(
    spec: OpenAPI.Document,
    baseUrl: string
  ): HarRequest[] {
    const harList: HarRequest[] = [];

    for (const [path, pathMethods] of Object.entries(spec.paths)) {
      const methods: [string, any][] = Object.entries(pathMethods).filter(
        ([method, _payload]: [string, any]) =>
          !method.toLowerCase().startsWith('x-swagger-router-controller')
      );

      for (const [method] of methods) {
        const url = `${removeTrailingSlash(baseUrl)}/${removeLeadingSlash(
          path
        )}`;
        const har = this.createHar(spec, baseUrl, path, method);

        harList.push({
          url,
          har,
          method: method.toUpperCase(),
          description:
            spec.paths[path][method].description || 'No description available'
        });
      }
    }

    return harList;
  }

  private createHar(
    spec: OpenAPI.Document,
    baseUrl: string,
    path: string,
    method: string,
    queryParamValues: Record<string, string> = {}
  ): Request {
    const queryString =
      this.getQueryStrings(spec, path, method, queryParamValues) || [];
    const rawUrl = `${baseUrl}${this.serializePath(spec, path, method)}${
      queryString.length
        ? `?${queryString.map((x) => `${x.name}=${x.value}`).join('&')}`
        : ''
    }`;
    const jsonPointer = pointer.compile(['paths', path, method]);
    const url = this.normalizeUrl(rawUrl, { jsonPointer });

    const har: Request = {
      queryString,
      url,
      method: method.toUpperCase(),
      headers: this.getHeadersArray(spec, path, method),
      httpVersion: 'HTTP/1.1',
      cookies: [],
      headersSize: 0,
      bodySize: 0
    };

    // get payload data, if available:
    const postData = this.getPayload(spec, path, method);

    if (postData) {
      har.postData = postData;
    }

    return har;
  }

  private normalizeUrl(url: string, context?: { jsonPointer: string }) {
    try {
      return normalizeUrl(url);
    } catch (e) {
      throw new ConvertError(e.message, context?.jsonPointer);
    }
  }

  // eslint-disable-next-line complexity
  private getPayload(
    spec: OpenAPI.Document,
    path: string,
    method: string
  ): PostData | null {
    const pathObj = spec.paths[path][method];
    const tokens = ['paths', path, method];
    const params = Array.isArray(pathObj.parameters) ? pathObj.parameters : [];

    for (const param of params) {
      if (
        typeof param.in === 'string' &&
        param.in.toLowerCase() === 'body' &&
        'schema' in param
      ) {
        const data = this.sampleParam(param, {
          spec,
          tokens,
          idx: pathObj.parameters.indexOf(param)
        });

        let consumes;

        if (pathObj.consumes?.length) {
          consumes = pathObj.consumes;
        } else if (this.isOASV2(spec) && spec.consumes?.length) {
          consumes = spec.consumes;
        }

        const paramContentType = this.sample({
          type: 'array',
          examples: consumes || ['application/json']
        });

        return this.encodePayload(data, paramContentType);
      }
    }

    const content = pathObj.requestBody?.content ?? {};
    const keys = Object.keys(content);

    if (!keys.length) {
      return null;
    }

    const contentType = this.sample({
      type: 'array',
      examples: keys
    });
    const sampleContent = content[contentType];

    if (sampleContent?.schema) {
      const data = this.sample(sampleContent.schema, {
        spec,
        jsonPointer: pointer.compile([
          ...tokens,
          'requestBody',
          'content',
          contentType,
          'schema'
        ])
      });

      return this.encodePayload(data, contentType, sampleContent.encoding);
    }

    return null;
  }

  private encodePayload(
    data: any,
    contentType: string,
    encoding?: any
  ): { mimeType: string; text: string } {
    let encodedData = data;

    if (encoding) {
      encodedData = this.encodeProperties(
        Object.keys(encoding),
        data,
        encoding
      );
    }

    return {
      mimeType: contentType.includes('multipart')
        ? `${contentType}; boundary=${this.BOUNDARY}`
        : contentType,
      text: this.encodeValue(encodedData, contentType, encoding)
    };
  }

  // eslint-disable-next-line complexity
  private encodeValue(value: any, contentType: string, encoding?: any): string {
    switch (contentType) {
      case 'application/json':
        return JSON.stringify(value);

      case 'application/x-www-form-urlencoded':
        return stringify(value, {
          format: 'RFC3986',
          encode: false
        });

      case 'application/xml':
        // eslint-disable-next-line no-case-declarations
        const xmlOptions = {
          header: true,
          indent: '  '
        };

        return toXML(value, xmlOptions);

      case 'multipart/form-data':
      case 'multipart/mixin':
        // eslint-disable-next-line no-case-declarations
        const EOL = '\r\n';

        // eslint-disable-next-line no-case-declarations
        let rawData = Object.keys(value || {})
          .reduce((params: string[], key: string) => {
            const multipartContentType = this.getMultipartContentType(
              value[key],
              key,
              encoding
            );

            let param = `--${this.BOUNDARY}${EOL}`;

            switch (multipartContentType) {
              case 'text/plain':
                param += `Content-Disposition: form-data; name="${key}"${
                  EOL + EOL
                }`;
                break;
              case 'application/json':
                param += `Content-Disposition: form-data; name="${key}"${EOL}`;
                param += `Content-Type: ${multipartContentType}${EOL + EOL}`;
                break;
              default: {
                param += `Content-Disposition: form-data; name="${key}"; filename="${key}"${EOL}`;
                param += `Content-Type: ${multipartContentType}${EOL}`;
                param += `Content-Transfer-Encoding: base64${EOL + EOL}`;
              }
            }

            param +=
              typeof value[key] === 'object'
                ? JSON.stringify(value[key])
                : value[key];

            params.push(param);

            return params;
          }, [] as string[])
          .join(EOL);

        rawData += EOL;
        rawData += `--${this.BOUNDARY}--`;

        return rawData;

      case 'image/jpg':
      case 'image/jpeg':
        return this.JPG_IMAGE;

      case 'image/png':
      case 'image/*':
        return this.PNG_IMAGE;

      default:
        return typeof value === 'object' ? JSON.stringify(value) : value;
    }
  }

  private getMultipartContentType(
    value: any,
    paramKey: string,
    encoding: any
  ): string {
    if (encoding && encoding[paramKey] && encoding[paramKey].contentType) {
      return encoding[paramKey].contentType;
    }

    switch (typeof value) {
      case 'object':
        return 'application/json';
      case 'string':
        return this.BASE64_PATTERN.test(value)
          ? 'application/octet-stream'
          : 'text/plain';
      case 'number':
      case 'boolean':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  private encodeProperties(keys: string[], data: any, encoding: any): string {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const encodedSample = keys.reduce((encodedSample, encodingKey) => {
      encodedSample[encodingKey] = this.encodeValue(
        data[encodingKey],
        encoding[encodingKey].contentType
      );

      return encodedSample;
    }, {});

    return Object.assign({}, data, encodedSample);
  }

  // eslint-disable-next-line complexity
  private getQueryStrings(
    spec: OpenAPI.Document,
    path: string,
    method: string,
    values: Record<string, string> = {}
  ): QueryString[] {
    const queryStrings: QueryString[] = [];
    const pathObj = spec.paths[path][method];
    const tokens = ['paths', path, method];
    const params = Array.isArray(pathObj.parameters) ? pathObj.parameters : [];

    for (const param of params) {
      if (typeof param.in === 'string' && param.in.toLowerCase() === 'query') {
        const data = this.sampleParam(param, {
          spec,
          tokens,
          idx: params.indexOf(param)
        });

        if (typeof values[param.name] !== 'undefined') {
          queryStrings.push({
            name: param.name,
            value: `${values[param.name]}`
          });
        } else if (typeof param.default === 'undefined') {
          queryStrings.push(
            ...this.paramsSerialization(param.name, data, {
              style:
                param.style === 'undefined'
                  ? param.collectionFormat
                  : param.style,
              explode: param.explode
            }).values
          );
        } else {
          queryStrings.push({
            name: param.name,
            value: `${param.default}`
          });
        }
      }
    }

    return queryStrings;
  }

  // eslint-disable-next-line complexity
  private getHeadersArray(
    spec: OpenAPI.Document,
    path: string,
    method: string
  ): Header[] {
    const headers: Header[] = [];
    const pathObj = spec.paths[path][method];
    const tokens = ['paths', path, method];

    // 'content-type' header:
    if (Array.isArray(pathObj.consumes)) {
      for (const value of pathObj.consumes) {
        headers.push({
          value,
          name: 'content-type'
        });
      }
    }

    // 'accept' header:
    if (Array.isArray(pathObj.produces)) {
      for (const value of pathObj.produces) {
        headers.push({
          value,
          name: 'accept'
        });
      }
    }

    // v3 'content-type' header:
    if (pathObj.requestBody?.content) {
      for (const value of Object.keys(pathObj.requestBody.content)) {
        headers.push({
          value,
          name: 'content-type'
        });
      }
    }

    const params = Array.isArray(pathObj.parameters) ? pathObj.parameters : [];

    // headers defined in path object:
    for (const param of params) {
      if (typeof param.in === 'string' && param.in.toLowerCase() === 'header') {
        const data = this.sampleParam(param, {
          spec,
          tokens,
          idx: params.indexOf(param)
        });

        headers.push({
          name: param.name.toLowerCase(),
          value: typeof data === 'object' ? JSON.stringify(data) : data
        });
      }
    }

    // security:
    let securityObj: Record<string, string[]>[];

    if (Array.isArray(pathObj.security)) {
      securityObj = pathObj.security;
    } else if (Array.isArray(spec.security)) {
      securityObj = spec.security;
    }

    if (!securityObj) {
      return headers;
    }

    let definedSchemes;

    if (this.isOASV2(spec) && spec.securityDefinitions) {
      definedSchemes = spec.securityDefinitions;
    } else if (this.isOASV3(spec) && spec.components) {
      definedSchemes = spec.components.securitySchemes;
    }

    if (!definedSchemes) {
      return headers;
    }

    let basicAuthDef;
    let apiKeyAuthDef;
    let oauthDef;

    for (const obj of securityObj) {
      const secScheme = Object.keys(obj)[0];
      const secDefinition = definedSchemes[secScheme];
      const authType = (secDefinition as any).type?.toLowerCase();
      switch (authType) {
        case 'http':
          // eslint-disable-next-line no-case-declarations
          const authScheme = (secDefinition as any).scheme?.toLowerCase();
          switch (authScheme) {
            case 'bearer':
              oauthDef = secScheme;
              break;
            case 'basic':
              basicAuthDef = secScheme;
              break;
          }
          break;
        case 'basic':
          basicAuthDef = secScheme;
          break;
        case 'apikey':
          if ((secDefinition as any).in === 'header') {
            apiKeyAuthDef = secDefinition;
          }
          break;
        case 'oauth2':
          oauthDef = secScheme;
          break;
      }
    }

    if (basicAuthDef) {
      headers.push({
        name: 'authorization',
        value: `Basic REPLACE_BASIC_AUTH`
      });
    } else if (typeof (apiKeyAuthDef as any)?.name === 'string') {
      headers.push({
        name: (apiKeyAuthDef as any).name.toLowerCase(),
        value: 'REPLACE_KEY_VALUE'
      });
    } else if (oauthDef) {
      headers.push({
        name: 'authorization',
        value: `Bearer REPLACE_BEARER_TOKEN`
      });
    }

    return headers;
  }

  private sampleParam(
    param: OpenAPI.Parameter,
    context: {
      spec: OpenAPI.Document;
      idx: number;
      tokens: string[];
    }
  ): any {
    return this.sample('schema' in param ? param.schema : param, {
      spec: context.spec,
      jsonPointer: pointer.compile([
        ...context.tokens,
        'parameters',
        context.idx.toString(),
        ...('schema' in param ? ['schema'] : [])
      ])
    });
  }

  private paramsSerialization(name: string, value: any, options: any): any {
    options = Object.assign({ style: 'form', explode: true }, options);

    const getDelimiter = () => {
      if (options.explode) {
        return '&';
      }

      switch (options.style) {
        case 'spaceDelimited':
        case 'ssv':
          return ' ';
        case 'pipeDelimited':
        case 'pipes':
          return '|';
        case 'form':
        case 'multi':
          return ',';
        default:
          return '&';
      }
    };

    const delimiter = getDelimiter();

    const transposeValue = (val: any) => {
      if (options.explode) {
        return val;
      }

      if (Array.isArray(val)) {
        return val.join(delimiter);
      } else if (isObject(val)) {
        return this.flattener.toFlattenArray(val).join(delimiter);
      }

      return val;
    };

    const ignoreValues = (val: any) =>
      isObject(val) &&
      ['spaceDelimited', 'pipeDelimited', 'pipes', 'ssv'].includes(
        options.style
      );

    const transposed = transposeValue(value);

    const arrayFormat =
      options.explode && Array.isArray(transposed) ? 'repeat' : 'indices';

    const object = isObject(transposed) ? transposed : { [name]: transposed };

    const queryString = stringify(!ignoreValues(value) ? object : '', {
      delimiter,
      arrayFormat,
      format: 'RFC3986',
      encode: false,
      addQueryPrefix: false
    });

    return {
      queryString,
      values: this.createQueryStringEntries(name, transposed)
    };
  }

  private createQueryStringEntries(
    name: string,
    value: any
  ): Record<string, string>[] {
    let values: Record<string, string>[];

    if (isObject(value)) {
      const flatten = this.flattener.toFlattenObject(value, {
        format: 'indices'
      });
      values = Object.entries(flatten).map(([n, x]: any[]) => ({
        name: n,
        value: `${x}`
      }));
    } else if (Array.isArray(value)) {
      values = value.map((x) => ({ name, value: `${x}` }));
    } else {
      values = [
        {
          name,
          value: `${value}`
        }
      ];
    }

    return values;
  }

  private serializePath(
    spec: OpenAPI.Document,
    path: string,
    method: string
  ): string {
    const templateUrl = template.parse(path);
    const pathParams = {};
    const pathObj = spec.paths[path][method];
    const tokens = ['paths', path, method];
    const params = Array.isArray(pathObj.parameters) ? pathObj.parameters : [];

    for (const param of params) {
      if (typeof param.in === 'string' && param.in.toLowerCase() === 'path') {
        const data = this.sampleParam(param, {
          spec,
          tokens,
          idx: pathObj.parameters.indexOf(param)
        });
        Object.assign(pathParams, { [param.name]: data });
      }
    }

    return templateUrl.expand(pathParams);
  }

  private getBaseUrl(spec: OpenAPI.Document): string {
    const urls: string[] = this.parseUrls(spec);

    if (!Array.isArray(urls) || !urls.length) {
      throw new ConvertError(
        'Target must be specified',
        this.isOASV2(spec) ? '/host' : '/servers'
      );
    }

    let preferredUrls: string[] = urls.filter(
      (x) => x.startsWith('https') || x.startsWith('wss')
    );

    if (!preferredUrls.length) {
      preferredUrls = urls;
    }

    return this.sample({
      type: 'array',
      examples: preferredUrls
    });
  }

  private parseUrls(spec: OpenAPI.Document): string[] {
    if (this.isOASV3(spec) && spec.servers?.length) {
      return this.parseServers(spec);
    }

    if (this.isOASV2(spec) && spec.host) {
      return this.parseHost(spec);
    }

    return [];
  }

  private parseHost(spec: OpenAPIV2.Document): string[] {
    const basePath = removeLeadingSlash(
      typeof spec.basePath === 'string' ? spec.basePath : ''
    ).trim();
    const host = removeTrailingSlash(
      typeof spec.host === 'string' ? spec.host : ''
    ).trim();

    if (!host) {
      throw new ConvertError('Missing mandatory `host` field', '/host');
    }

    const schemes: string[] = Array.isArray(spec.schemes)
      ? spec.schemes
      : ['https'];

    return schemes.map((x: string, idx: number) =>
      this.normalizeUrl(`${x}://${host}/${basePath}`, {
        jsonPointer: pointer.compile(['schemes', idx.toString()])
      })
    );
  }

  private parseServers(spec: OpenAPIV3.Document): string[] {
    return spec.servers.map((server: OpenAPIV3.ServerObject, idx: number) => {
      const variables = server.variables || {};
      const params = Object.entries(variables).reduce(
        (acc, [param, variable]: [string, OpenAPIV3.ServerVariableObject]) => ({
          ...acc,
          [param]: this.sample(variable, {
            spec,
            jsonPointer: pointer.compile([
              'servers',
              idx.toString(),
              'variables',
              param
            ])
          })
        }),
        {}
      );
      const templateUrl = template.parse(server.url);
      const rawUrl = templateUrl.expand(params);
      const jsonPointer = pointer.compile(['servers', idx.toString()]);

      return this.normalizeUrl(rawUrl, { jsonPointer });
    });
  }

  /**
   * To exclude extra fields that are used in response only, {@link Options.skipReadOnly} must be used.
   * @see {@link https://swagger.io/docs/specification/data-models/data-types/#readonly-writeonly | Read-Only and Write-Only Properties}
   */
  private sample(
    schema: Schema,
    context?: {
      spec?: OpenAPI.Document;
      jsonPointer?: string;
    }
  ): any | undefined {
    try {
      return sample(schema, { skipReadOnly: true, quiet: true }, context?.spec);
    } catch (e) {
      throw new ConvertError(e.message, context?.jsonPointer);
    }
  }

  private isOASV2(doc: OpenAPI.Document): doc is OpenAPIV2.Document {
    return 'swagger' in doc;
  }

  private isOASV3(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
    return 'openapi' in doc;
  }
}
