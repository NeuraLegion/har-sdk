import {
  MediaTypeObject,
  EncodingHandler,
  SchemaObject
} from './EncodingHandler';

export class DefaultEncodingHandler implements EncodingHandler {
  private readonly BASE64_FORMATS: readonly string[] = ['byte', 'base64'];
  private readonly BINARY_FORMATS: readonly string[] = [
    'binary',
    ...this.BASE64_FORMATS
  ];

  public isArbitraryBinary = (_mediaType: string, _schema?: SchemaObject) =>
    false;

  public shouldEncodeProperties(
    mediaType: string,
    media: MediaTypeObject
  ): boolean {
    return (
      (mediaType.startsWith('multipart/') ||
        mediaType === 'application/x-www-form-urlencoded') &&
      !!media.encoding
    );
  }

  public resolvePropertyContentType(
    value: unknown,
    schema?: SchemaObject
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
}
