import type { Sampler } from '../../Sampler';
import type { SubConverter } from '../../SubConverter';
import { XmlSerializer } from '../../serializers';
import { base64 } from '../../../utils';
import type { OpenAPI, OpenAPIV2, OpenAPIV3, PostData } from '@har-sdk/core';
import { stringify } from 'qs';

export interface EncodingData {
  value: unknown;
  contentType: string;
  fields?: Record<string, OpenAPIV3.EncodingObject>;
  schema?: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject;
}

export abstract class BodyConverter<T extends OpenAPI.Document>
  implements SubConverter<PostData | null>
{
  private readonly xmlSerializer = new XmlSerializer();
  private readonly JPG_IMAGE = '\xff\xd8\xff\xe0';
  private readonly PNG_IMAGE = '\x89\x50\x4e\x47\x0d\x0A\x1a\x0a';
  private readonly ICO_IMAGE = '\x00\x00\x01\x00';
  private readonly GIF_IMAGE = '\x47\x49\x46\x38\x37\x61';
  private readonly BOUNDARY = '956888039105887155673143';
  private readonly BASE64_FORMATS: readonly string[] = ['byte', 'base64'];
  private readonly BINARY_FORMATS: readonly string[] = [
    'binary',
    ...this.BASE64_FORMATS
  ];

  protected constructor(
    protected readonly spec: T,
    protected readonly sampler: Sampler
  ) {}

  public abstract convert(path: string, method: string): PostData | null;

  protected abstract getContentType(
    path: string,
    method: string
  ): string | undefined;

  protected encodePayload({ contentType, ...options }: EncodingData): PostData {
    return {
      mimeType: contentType.includes('multipart')
        ? `${contentType}; boundary=${this.BOUNDARY}`
        : contentType,
      text: this.encodeValue({
        contentType,
        ...options
      })
    };
  }

  // eslint-disable-next-line complexity
  protected encodeValue({
    value,
    contentType,
    schema,
    fields
  }: EncodingData): string {
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
        return this.encodeMultipartFormData(value, fields, schema);
      case 'image/x-icon':
      case 'image/ico':
      case 'image/vnd.microsoft.icon':
        return this.encodeBinary(this.ICO_IMAGE, schema);
      case 'image/jpg':
      case 'image/jpeg':
        return this.encodeBinary(this.JPG_IMAGE, schema);
      case 'image/gif':
        return this.encodeBinary(this.GIF_IMAGE, schema);
      case 'image/png':
      case 'image/*':
        return this.encodeBinary(this.PNG_IMAGE, schema);
      default:
        return this.encodeOther(value);
    }
  }

  private encodeBinary(
    value: unknown,
    schema?: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject
  ): string {
    const encoded = this.encodeOther(value);

    return this.BASE64_FORMATS.includes(schema?.format)
      ? base64(encoded)
      : encoded;
  }

  // TODO: move the logic that receives the content type from the encoding object
  //  to the {@link Oas3RequestBodyConverter} class.
  private encodeMultipartFormData(
    value: unknown,
    fields?: Record<string, OpenAPIV3.EncodingObject>,
    schema?: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): string {
    const EOL = '\r\n';

    return Object.entries(value || {})
      .map(([key, val]: [string, unknown]) => {
        const propertySchema = this.getPropertySchema(key, schema);
        const contentType =
          fields?.[key]?.contentType ??
          this.inferContentType(val, propertySchema);

        const headers = [
          `Content-Disposition: form-data; name="${key}"${
            this.filenameRequired(contentType) ? `; filename="${key}"` : ''
          }`,
          ...(contentType !== 'text/plain'
            ? [`Content-Type: ${contentType}`]
            : []),
          ...(this.BASE64_FORMATS.includes(propertySchema?.format)
            ? ['Content-Transfer-Encoding: base64']
            : [])
        ];
        const body = this.encodeOther(val);

        return `--${this.BOUNDARY}${EOL}${headers.join(
          EOL
        )}${EOL}${EOL}${body}`;
      })
      .join(EOL)
      .concat(`${EOL}--${this.BOUNDARY}--`);
  }

  private getPropertySchema(
    key: string,
    schema?: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject | undefined {
    if (schema?.type === 'object') {
      return schema.properties?.[key];
    }

    if (schema?.type === 'array') {
      return schema.items;
    }

    return undefined;
  }

  private filenameRequired(contentType: string): boolean {
    return 'application/octet-stream' === contentType;
  }

  private inferContentType(
    value: unknown,
    schema?: OpenAPIV2.SchemaObject | OpenAPIV3.SchemaObject
  ): string {
    switch (typeof value) {
      case 'object':
        return 'application/json';
      case 'string':
        return this.BINARY_FORMATS.includes(schema?.format)
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

  // TODO: we should take into account the the Encoding Object's style property (OAS3)
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
