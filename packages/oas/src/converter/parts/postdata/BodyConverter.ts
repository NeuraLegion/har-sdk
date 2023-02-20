import type { Sampler } from '../../Sampler';
import type { SubConverter } from '../../SubConverter';
import { XmlSerializer } from '../../serializers';
import type { OpenAPI, OpenAPIV2, OpenAPIV3, PostData } from '@har-sdk/core';
import { stringify } from 'qs';

export abstract class BodyConverter<T extends OpenAPI.Document>
  implements SubConverter<PostData | null>
{
  private readonly xmlSerializer = new XmlSerializer();
  private readonly JPG_IMAGE = '/9j/7g=='; // 0xff, 0xd8, 0xff, 0xee
  private readonly PNG_IMAGE = 'iVBORw0KGgo='; // 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0A, 0x1a, 0x0a
  private readonly ICO_IMAGE = 'AAABAA=='; // 0x00, 0x00, 0x01, 0x00
  private readonly GIF_IMAGE = 'R0lGODdh'; // 0x47, 0x49, 0x46, 0x38, 0x37, 0x61
  private readonly BOUNDARY = '956888039105887155673143';
  private readonly BASE64_PATTERN =
    /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;

  protected constructor(
    protected readonly spec: T,
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
    schema?: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): PostData {
    return {
      mimeType: contentType.includes('multipart')
        ? `${contentType}; boundary=${this.BOUNDARY}`
        : contentType,
      text: this.encodeValue(data, contentType, schema)
    };
  }

  // eslint-disable-next-line complexity
  protected encodeValue(
    value: unknown,
    contentType: string,
    schema?: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
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
      case 'text/xml':
      case 'application/atom+xml':
        return this.encodeXml(value, schema);
      case 'multipart/form-data':
      case 'multipart/mixed':
        return this.encodeMultipartFormData(value);
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

  private encodeMultipartFormData(value: unknown): string {
    const EOL = '\r\n';

    return Object.entries(value || {})
      .map(([key, val]: [string, unknown]) => {
        // FIXME: use the MIME type specified in the encoding object if present.
        const contentType = this.inferMultipartContentType(val);
        const filenameRequired = this.filenameRequired(contentType);
        const content = this.encodeOther(val);

        const headers = [
          `Content-Disposition: form-data; name="${key}"${
            filenameRequired ? `; filename="${key}"` : ''
          }`,
          ...(contentType !== 'text/plain'
            ? [`Content-Type: ${contentType}`]
            : []),
          ...(this.BASE64_PATTERN.test(content) &&
          contentType === 'application/octet-stream'
            ? [`Content-Transfer-Encoding: base64`]
            : [])
        ];
        const body = `${headers.join(EOL)}${EOL}${EOL}${content}`;

        return `--${this.BOUNDARY}${EOL}${body}`;
      })
      .join(EOL)
      .concat(`${EOL}--${this.BOUNDARY}--`);
  }

  private filenameRequired(contentType: string) {
    return !['application/json', 'text/plain'].includes(contentType);
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
      case 'bigint':
      case 'symbol':
      case 'undefined':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
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

  private encodeXml(
    data: unknown,
    schema: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): string {
    return this.xmlSerializer.serialize(data, schema);
  }

  private encodeOther(value: unknown): string {
    return typeof value === 'object'
      ? JSON.stringify(value)
      : value?.toString();
  }
}
