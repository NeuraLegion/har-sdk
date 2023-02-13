import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import { OpenAPI, OpenAPIV3, PostData } from '@har-sdk/core';
import { toXML, XmlElement } from 'jstoxml';
import { stringify } from 'qs';

export abstract class BodyConverter implements SubConverter<PostData | null> {
  private readonly JPG_IMAGE = '/9j/7g=='; // 0xff, 0xd8, 0xff, 0xee
  private readonly PNG_IMAGE = 'iVBORw0KGgo='; // 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0A, 0x1a, 0x0a
  private readonly ICO_IMAGE = 'AAABAA=='; // 0x00, 0x00, 0x01, 0x00
  private readonly GIF_IMAGE = 'R0lGODdh'; // 0x47, 0x49, 0x46, 0x38, 0x37, 0x61
  private readonly BOUNDARY = '956888039105887155673143';
  private readonly BASE64_PATTERN =
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;

  protected constructor(
    protected readonly spec: OpenAPI.Document,
    protected readonly sampler: Sampler
  ) {}

  public abstract convert(path: string, method: string): PostData | null;

  protected abstract getContentType(
    path: string,
    method: string
  ): string | undefined;

  protected encodePayload(
    data: unknown,
    contentType: string,
    encoding?: OpenAPIV3.EncodingObject
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
      text: this.encodeValue(encodedData, contentType)
    };
  }

  // eslint-disable-next-line complexity
  private encodeValue(
    value: unknown,
    contentType: string,
    encoding?: string
  ): string {
    const [mime]: string[] = contentType
      .split(',')
      .map((x) => x.trim().replace(/;.+?$/, ''));

    switch (mime) {
      case 'application/json':
        return this.encodeJson(value);
      case 'application/x-www-form-urlencoded':
        return this.encodeFormUrlencoded(value);
      case 'application/xml':
        return this.encodeXml(value);
      case 'multipart/form-data':
      case 'multipart/mixin':
        return this.encodeMultipartFormData(value, encoding);
      case 'image/x-icon':
      case 'image/ico':
      case 'image/vnd.microsoft.icon':
        return this.ICO_IMAGE;
      case 'image/jpg':
      case 'image/jpeg':
        return this.JPG_IMAGE;
      case 'image/gif':
        return this.GIF_IMAGE;
      case 'image/png':
      case 'image/*':
        return this.PNG_IMAGE;
      default:
        return this.encodeOther(value);
    }
  }

  private encodeMultipartFormData(value: unknown, encoding?: string) {
    const EOL = '\r\n';

    const parts = Object.keys(value || {}).reduce(
      (params: string[], key: string) => {
        const multipartContentType =
          encoding ?? this.inferMultipartContentType(value[key]);

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
      },
      []
    );

    return `${parts.join(EOL)}${EOL}--${this.BOUNDARY}--`;
  }

  private inferMultipartContentType(value: unknown): string {
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

  private encodeProperties(
    keys: string[],
    data: unknown,
    encoding?: OpenAPIV3.EncodingObject
  ): unknown {
    const sample = keys.reduce((encodedSample, encodingKey) => {
      const { contentType }: OpenAPIV3.EncodingObject =
        encoding?.[encodingKey] ?? {};

      encodedSample[encodingKey] = this.encodeValue(
        data[encodingKey],
        contentType,
        encodingKey
      );

      return encodedSample;
    }, {});

    return Object.assign({}, data, sample);
  }

  private encodeJson(value: unknown): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private encodeFormUrlencoded(value: unknown): string {
    return stringify(value, {
      format: 'RFC3986',
      encode: false
    });
  }

  private encodeXml(value: unknown): string {
    const xmlOptions = {
      header: true,
      indent: '  '
    };

    return toXML(value as XmlElement, xmlOptions);
  }

  private encodeOther(value: unknown): string {
    return typeof value === 'object'
      ? JSON.stringify(value)
      : value?.toString();
  }
}
