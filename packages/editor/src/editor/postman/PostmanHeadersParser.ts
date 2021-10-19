import { Parser } from '../Parser';
import { Postman } from '@har-sdk/types';
import jsonPointer from 'json-pointer';

export class PostmanHeadersParser implements Parser<Postman.Header[]> {
  constructor(private readonly doc: Postman.Document) {}

  public parse(pointer: string): Postman.Header[] {
    const headers: Postman.Header[] | string = jsonPointer.has(
      this.doc,
      pointer
    )
      ? jsonPointer.get(this.doc, pointer)
      : undefined;

    if (!headers) {
      return [];
    }

    return Array.isArray(headers)
      ? headers
      : headers.split('\n').map((pair: string) => {
          const [key, value]: string[] = pair
            .split(':')
            .map((x: string) => x.trim());

          return {
            key,
            value: value ?? ''
          };
        });
  }
}
