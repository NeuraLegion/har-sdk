import {
  BuilderEntryParams,
  FromDataType,
  HarBuilder,
  HarEntry,
  HarPostData,
  HarRequest,
  HarResponse,
  Options,
  Request
} from './HarBuilder';
import { Parser } from '../parser';
import { transformBinaryToUtf8 } from '../utils';
import { isReadable } from '../utils/isReadable';
import Har from 'har-format';
import { Headers, Response } from 'request';
import tough from 'tough-cookie';
import contentType from 'content-type';
import querystring from 'querystring';

export class DefaultHarBuilder implements HarBuilder {
  private readonly BASE64_PATTERN = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;

  constructor(private readonly parser: Parser) {}

  public buildHarEntry({
    request,
    response,
    error,
    harConfig,
    redirectUrl,
    meta
  }: BuilderEntryParams): HarEntry {
    return {
      startedDateTime: new Date(meta.startTime).toISOString(),
      time: meta.duration,
      request: this.buildHarRequest(request),
      response: this.buildHarResponse({
        error,
        response,
        harConfig,
        redirectUrl,
        meta
      }),
      cache: {},
      timings: {
        send: 0,
        receive: 0,
        wait: meta.duration
      }
    };
  }

  public buildHarConfig(harConfig: Options): Options {
    return Object.assign(
      {},
      {
        withContent: true,
        maxContentLength: Infinity
      },
      harConfig
    );
  }

  private buildHarRequest(request: Request): HarRequest {
    return {
      method: (request.method && request.method.toUpperCase()) || '',
      url: (request.uri && request.uri.href) || '',
      httpVersion: 'HTTP/1.1',
      cookies: this.buildHarCookies(
        request.headers &&
          request.headers.cookie &&
          request.headers.cookie.split(';')
      ),
      headers: this.buildHarHeaders(
        (request.req && request.req._headers) || request.headers
      ),
      queryString: this.buildHarQuery(
        request.uri && (request.uri.query as string)
      ),
      postData: this.buildHarPostData(request),
      headersSize: -1,
      bodySize: -1
    };
  }

  private buildHarResponse({
    response,
    error,
    harConfig,
    redirectUrl,
    meta
  }: BuilderEntryParams): HarResponse {
    const setCookieHeader =
      response?.headers && response.headers['set-cookie']
        ? Array.isArray(response.headers['set-cookie'])
          ? response.headers['set-cookie']
          : [response.headers['set-cookie']]
        : [];

    const harResponse: HarResponse = {
      status: response?.statusCode && !error ? response.statusCode : 0,
      statusText: response?.statusMessage || '',
      httpVersion: this.parser.parseHttpVersion(response),
      cookies: this.buildHarCookies(setCookieHeader),
      headers: this.buildHarHeaders(response?.headers),
      content: this.buildHarContent(response, harConfig),
      redirectURL: redirectUrl,
      headersSize: -1,
      bodySize: -1,
      _remoteAddress: meta.remoteAddress
    };

    if (error) {
      harResponse._error = {
        message: error.message,
        code: error.code
      };
    }

    return harResponse;
  }

  private buildHarCookie(cookie: tough.Cookie): Har.Cookie {
    const harCookie: Har.Cookie = {
      name: cookie.key,
      value: cookie.value,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure
    };

    if (cookie.path) {
      harCookie.path = cookie.path;
    }

    if (cookie.domain) {
      harCookie.domain = cookie.domain;
    }

    if (cookie.expires instanceof Date) {
      harCookie.expires = cookie.expires.toISOString();
    }

    return harCookie;
  }

  private buildHarCookies(cookies: string[]): Har.Cookie[] {
    if (!cookies) {
      return [];
    }

    return cookies
      .map((cookie) => tough.parse(cookie))
      .filter((cookie) => cookie)
      .map((cookie) => this.buildHarCookie(cookie));
  }

  private buildFlattenedNameValueMap(
    obj: NodeJS.Dict<string | string[]>
  ): Record<string, string>[] {
    if (!obj) {
      return [];
    }

    return Object.keys(obj).reduce((result, key) => {
      const value = obj[key];
      if (Array.isArray(value)) {
        return result.concat(
          value.map((v) => ({
            name: key,
            value: transformBinaryToUtf8(v)
          }))
        );
      } else {
        return result.concat({
          name: key,
          value: transformBinaryToUtf8(value)
        });
      }
    }, []);
  }

  private buildHarHeaders(headers: Headers): Har.Header[] {
    return (this.buildFlattenedNameValueMap(
      headers
    ) as unknown) as Har.Header[];
  }

  private buildHarQuery(query: string): Har.QueryString[] {
    return (this.buildFlattenedNameValueMap(
      querystring.parse(query)
    ) as unknown) as Har.QueryString[];
  }

  private getMultipartContentType(param: Har.Param): string {
    if (param && param.contentType) {
      return param.contentType;
    }

    if (param.value.startsWith('{') && param.value.endsWith('}')) {
      return 'application/json';
    }

    if (this.BASE64_PATTERN.test(param.value)) {
      return 'application/octet-stream';
    }
  }

  private convertFormDataToText(value: Har.Param[], boundary: string): string {
    const EOL = '\r\n';

    let rawData = value
      .reduce((params: string[], item: Har.Param) => {
        const multipartContentType = this.getMultipartContentType(item);

        let param = `--${boundary}${EOL}`;

        param += `Content-Disposition: form-data; name="${item.name}"`;

        if (multipartContentType) {
          param += `${EOL}Content-Type: ${multipartContentType}`;
        }

        param += `${EOL + EOL}`;
        param +=
          typeof item.value === 'object'
            ? JSON.stringify(item.value)
            : item.value;

        params.push(param);

        return params;
      }, [])
      .join(EOL);

    rawData += EOL;
    rawData += `--${boundary}--`;

    return rawData;
  }

  private convertFormData(
    name: string,
    param: FromDataType,
    params: Har.Param[]
  ): void {
    switch (typeof param) {
      case 'object':
        if (Array.isArray(param)) {
          param.forEach((x) => this.convertFormData(name, x, params));
        } else if (Buffer.isBuffer(param)) {
          params.push({ name, value: param.toString('utf8') });
        } else if (isReadable(param)) {
          const value = Buffer.isBuffer(param.value)
            ? param.value.toString('utf8')
            : (param.value || '').toString();

          params.push({
            name,
            value,
            fileName: param.options.filename,
            contentType: param.options.contentType || this.getMimeType(value)
          });
        }
        break;
      default:
        params.push({
          name,
          value: (param || '').toString()
        });
    }
  }

  private buildHarPostData(request: Request): HarPostData {
    if (request.body) {
      return {
        mimeType: this.getMimeType(request),
        text: request.body as string
      };
    }

    if (request.formData) {
      const params: Har.Param[] = [];

      Object.keys(request.formData).forEach((name) => {
        const value = request.formData[name];
        this.convertFormData(name, value, params);
      });

      const header = request.getHeader('content-type');
      let boundary = header.split(' ')[1];
      boundary = boundary.split('=')[1];

      return {
        params,
        mimeType: 'multipart/form-data',
        text: this.convertFormDataToText(params, boundary)
      };
    }
  }

  private getMimeType(response: Response | Request | string): string {
    try {
      return contentType.parse(response).type;
    } catch {
      return 'x-unknown';
    }
  }

  private buildHarContent(response: Response, harConfig: Options): Har.Content {
    if (!response) {
      return { size: 0, mimeType: 'x-unknown' };
    }

    const { withContent = true } = harConfig;

    const harContent: Har.Content = {
      mimeType: this.getMimeType(response),
      size: 0
    };

    if (withContent && response.body) {
      if (typeof response.body === 'string') {
        harContent.text = response.body;
      } else if (Buffer.isBuffer(response.body)) {
        harContent.text = response.body.toString('base64');
        harContent.encoding = 'base64';
      } else {
        harContent.text = JSON.stringify(response.body);
        harContent.encoding = 'utf8';
      }
    }

    if (typeof response.body === 'string') {
      harContent.size = Buffer.byteLength(response.body);
    } else if (Buffer.isBuffer(response.body)) {
      harContent.size = response.body.length;
    } else if (harContent.text) {
      harContent.size = Buffer.byteLength(harContent.text);
    } else {
      harContent.size = 0;
    }

    return harContent;
  }
}
