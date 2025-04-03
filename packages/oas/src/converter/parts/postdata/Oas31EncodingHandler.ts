import {
  EncodingHandler,
  MediaTypeObject,
  SchemaObject
} from './EncodingHandler';

export class Oas31EncodingHandler implements EncodingHandler {
  private readonly NULL = 'null';
  private readonly APPLICATION_OCTET_STREAM = 'application/octet-stream';
  private readonly APPLICATION_JSON = 'application/json';
  private readonly TEXT_PLAIN = 'text/plain';

  private readonly BINARY_MEDIA_TYPES = [
    this.APPLICATION_OCTET_STREAM,
    'image/',
    'audio/',
    'video/',
    'font/'
  ];

  private readonly BASE64_FORMATS: readonly string[] = [
    'byte',
    'base64',
    'base64url'
  ];
  private readonly BINARY_FORMATS: readonly string[] = [
    'binary',
    ...this.BASE64_FORMATS
  ];

  public isArbitraryBinary(mediaType: string, schema?: SchemaObject): boolean {
    const binaryMediaType =
      typeof mediaType === 'string' &&
      this.BINARY_MEDIA_TYPES.some((prefix) => mediaType.startsWith(prefix));

    return binaryMediaType && (!schema || !schema.type);
  }

  public shouldEncodeProperties(
    mediaType: string,
    _media: MediaTypeObject
  ): boolean {
    return (
      mediaType.startsWith('multipart/') ||
      mediaType === 'application/x-www-form-urlencoded'
    );
  }

  // eslint-disable-next-line complexity
  public resolvePropertyContentType(
    value: unknown,
    schema?: SchemaObject
  ): string {
    const contentMediaType = (schema as any)?.contentMediaType;

    if (contentMediaType) {
      return contentMediaType;
    }

    // ADHOC: infer content type based on the schema type and contentEncoding
    // see https://spec.openapis.org/oas/v3.1.1.html#common-fixed-fields-0

    const contentEncoding = (schema as any)?.contentEncoding;

    switch (this.inferType(schema)) {
      case 'object':
        return this.APPLICATION_JSON;
      case 'array':
        return this.resolvePropertyContentType(
          value,
          ((schema as any).items ?? {}) as SchemaObject
        );
      case 'string':
        // ADHOC: take the contentEncoding first and preserve handling
        // of format for backward compatibility, despite it deprecated
        // https://spec.openapis.org/oas/v3.1.1.html#migrating-binary-descriptions-from-oas-3-0
        return contentEncoding
          ? this.APPLICATION_OCTET_STREAM
          : this.BINARY_FORMATS.includes(schema.format)
          ? this.APPLICATION_OCTET_STREAM
          : this.TEXT_PLAIN;
      case 'number':
      case 'integer':
      case 'boolean':
      case 'null':
        return this.TEXT_PLAIN;
      default:
        return this.APPLICATION_OCTET_STREAM;
    }
  }

  private inferType(schema?: SchemaObject): string {
    return !schema?.type
      ? ''
      : !Array.isArray(schema.type)
      ? schema.type
      : schema.type.find((x) => x !== this.NULL) ??
        schema.type.find((x) => x === this.NULL);
  }
}
