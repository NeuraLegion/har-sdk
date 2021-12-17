/* eslint-disable max-depth */
import { Converter } from './Converter';
import {
  Flattener,
  isObject,
  normalizeUrl,
  removeLeadingSlash,
  removeTrailingSlash
} from '../utils';
import { sample } from '@har-sdk/openapi-sampler';
import {
  Header,
  isOASV2,
  isOASV3,
  OpenAPI,
  OpenAPIV3,
  PostData,
  QueryString,
  Request
} from '@har-sdk/types';
import template from 'url-template';
import { toXML } from 'jstoxml';
import querystring from 'qs';
import $RefParser, { JSONSchema } from '@apidevtools/json-schema-ref-parser';

interface HarRequest {
  readonly method: string;
  readonly url: string;
  readonly description: string;
  readonly har: Request;
}

export class DefaultConverter implements Converter {
  private readonly BOUNDARY = '956888039105887155673143';
  private readonly BASE64_PATTERN =
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
  private readonly flattener = new Flattener();

  public async convert(spec: OpenAPI.Document): Promise<Request[]> {
    const dereferenceSpec = (await new $RefParser().dereference(
      JSON.parse(JSON.stringify(spec)) as JSONSchema
    )) as OpenAPI.Document;

    const baseUrl = normalizeUrl(this.getBaseUrl(dereferenceSpec));
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
        const url: string =
          removeTrailingSlash(baseUrl) + '/' + removeLeadingSlash(path);
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
    const queryString: QueryString[] =
      this.getQueryStrings(spec, path, method, queryParamValues) || [];
    const url =
      baseUrl +
      this.serializePath(spec, path, method) +
      (queryString.length
        ? '?' + queryString.map((x) => `${x.name}=${x.value}`).join('&')
        : '');

    const har: Request = {
      url: encodeURI(url),
      queryString,
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

  // eslint-disable-next-line complexity
  private getPayload(
    spec: OpenAPI.Document,
    path: string,
    method: string
  ): PostData | null {
    const pathObj = spec.paths[path][method];

    if (typeof pathObj.parameters !== 'undefined') {
      for (const param of pathObj.parameters) {
        if (
          typeof param.in !== 'undefined' &&
          param.in.toLowerCase() === 'body' &&
          typeof param.schema !== 'undefined'
        ) {
          try {
            const data = sample(param.schema, { skipReadOnly: true }, spec);

            let consumes;

            if (pathObj.consumes && pathObj.consumes.length) {
              consumes = pathObj.consumes;
            } else if (isOASV2(spec) && spec.consumes && spec.consumes.length) {
              consumes = spec.consumes;
            }

            const paramContentType = sample({
              type: 'array',
              examples: consumes ? consumes : ['application/json']
            });

            return this.encodePayload(data, paramContentType);
          } catch {
            return null;
          }
        }
      }
    }

    const content = spec.paths[path][method].requestBody
      ? spec.paths[path][method].requestBody.content
      : null;

    const keys = Object.keys(content || {});
    if (!keys.length) {
      return null;
    }

    const contentType = sample({
      type: 'array',
      examples: keys
    });

    if (content[contentType] && content[contentType].schema) {
      const sampleContent = content[contentType];
      const data = sample(
        content[contentType].schema,
        { skipReadOnly: true },
        spec
      );

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
        ? contentType + `; boundary=${this.BOUNDARY}`
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
        return querystring.stringify(value, {
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
        let rawData = Object.keys(value)
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
        return Buffer.from([0xff, 0xd8, 0xff, 0xdb]).toString('base64');

      case 'image/png':
      case 'image/*':
        return Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
        ]).toString('base64');

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

    if (typeof spec.paths[path][method].parameters === 'undefined') {
      return queryStrings;
    }

    for (const param of spec.paths[path][method].parameters) {
      if (
        typeof param.in !== 'undefined' &&
        param.in.toLowerCase() === 'query'
      ) {
        const data = sample(param.schema || param, {}, spec);

        if (typeof values[param.name] !== 'undefined') {
          queryStrings.push({
            name: param.name,
            value: values[param.name] + ''
          });
        } else {
          if (typeof param.default === 'undefined') {
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
              value: param.default + ''
            });
          }
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

    // 'content-type' header:
    if (typeof pathObj.consumes !== 'undefined') {
      for (const value of pathObj.consumes) {
        headers.push({
          value,
          name: 'content-type'
        });
      }
    }

    // 'accept' header:
    if (typeof pathObj.produces !== 'undefined') {
      for (const value of pathObj.produces) {
        headers.push({
          value,
          name: 'accept'
        });
      }
    }

    // v3 'content-type' header:
    if (pathObj.requestBody && pathObj.requestBody.content) {
      for (const value of Object.keys(pathObj.requestBody.content)) {
        headers.push({
          value,
          name: 'content-type'
        });
      }
    }

    // headers defined in path object:
    if (typeof pathObj.parameters !== 'undefined') {
      for (const param of pathObj.parameters) {
        if (
          typeof param.in !== 'undefined' &&
          param.in.toLowerCase() === 'header'
        ) {
          const data = sample(param.schema || param, {}, spec);
          headers.push({
            name: param.name.toLowerCase(),
            value: typeof data === 'object' ? JSON.stringify(data) : data
          });
        }
      }
    }

    // security:
    let securityObj: Record<string, string[]>[];

    if (typeof pathObj.security !== 'undefined') {
      securityObj = pathObj.security;
    } else if (typeof spec.security !== 'undefined') {
      securityObj = spec.security;
    }

    if (!securityObj) {
      return headers;
    }

    let definedSchemes;
    if (isOASV2(spec) && spec.securityDefinitions) {
      definedSchemes = spec.securityDefinitions;
    } else if (isOASV3(spec) && spec.components) {
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
        value: 'Basic ' + 'REPLACE_BASIC_AUTH'
      });
    } else if (apiKeyAuthDef) {
      headers.push({
        name: (apiKeyAuthDef as any).name?.toLowerCase(),
        value: 'REPLACE_KEY_VALUE'
      });
    } else if (oauthDef) {
      headers.push({
        name: 'authorization',
        value: 'Bearer ' + 'REPLACE_BEARER_TOKEN'
      });
    }

    return headers;
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
          return '%20';
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

    const queryString = querystring.stringify(
      !ignoreValues(value) ? object : '',
      {
        delimiter,
        arrayFormat,
        format: 'RFC3986',
        encode: false,
        addQueryPrefix: false
      }
    );

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
        value: x + ''
      }));
    } else if (Array.isArray(value)) {
      values = value.map((x) => ({ name, value: x + '' }));
    } else {
      values = [
        {
          name,
          value: value + ''
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
    const params = {};

    if (typeof spec.paths[path][method].parameters !== 'undefined') {
      for (const param of spec.paths[path][method].parameters) {
        if (param?.in.toLowerCase() === 'path') {
          const data = sample(param.schema || param, {}, spec);
          Object.assign(params, { [param.name]: data });
        }
      }
    }

    return templateUrl.expand(params);
  }

  private getBaseUrl(spec: OpenAPI.Document): string {
    const urls: string[] = this.parseUrls(spec);

    if (!Array.isArray(urls) || !urls.length) {
      throw new Error('None server or host is defined.');
    }

    let preferredUrls: string[] = urls.filter(
      (x) => x.startsWith('https') || x.startsWith('wss')
    );

    if (!preferredUrls.length) {
      preferredUrls = urls;
    }

    return sample({
      type: 'array',
      examples: preferredUrls
    });
  }

  private parseUrls(spec: OpenAPI.Document): string[] {
    if (isOASV3(spec) && spec.servers?.length) {
      return spec.servers.map((server: OpenAPIV3.ServerObject) => {
        const variables = server.variables || {};
        const templateUrl = template.parse(server.url);
        const params = {};

        for (const [param, variable] of Object.entries(variables)) {
          const data = sample(variable, {}, spec);
          Object.assign(params, { [param]: data });
        }

        return removeTrailingSlash(templateUrl.expand(params));
      });
    }

    if (isOASV2(spec) && spec.host) {
      const basePath: string =
        typeof spec.basePath !== 'undefined'
          ? removeLeadingSlash(spec.basePath)
          : '';
      const host: string = removeTrailingSlash(spec.host);
      const schemes: string[] =
        typeof spec.schemes !== 'undefined' ? spec.schemes : ['https'];

      return schemes.map(
        (x: string) => x + '://' + removeTrailingSlash(host + '/' + basePath)
      );
    }

    return [];
  }
}
