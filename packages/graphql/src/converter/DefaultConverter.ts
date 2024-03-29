import { Converter } from './Converter';
import { ConverterOptions } from './ConverterOptions';
import {
  Operation,
  Operations,
  DefaultOperations,
  OperationRequestBuilder
} from './operations';
import { GraphQL, Request } from '@har-sdk/core';

export class DefaultConverter implements Converter {
  constructor(
    private readonly operations: Operations = new DefaultOperations(),
    private readonly requestBuilder: OperationRequestBuilder = new OperationRequestBuilder()
  ) {}

  public async convert(
    doc: GraphQL.Document,
    options: ConverterOptions = {}
  ): Promise<Request[]> {
    if (!this.isGraphQLDocument(doc)) {
      throw new TypeError('Please provide a valid GraphQL document.');
    }

    const operations = this.operations.create(doc.data, options);

    return operations.map((operation: Operation) =>
      this.requestBuilder.build({ operation, url: doc.url })
    );
  }

  private isGraphQLDocument(obj: object): obj is GraphQL.Document {
    const hasValidUrl =
      'url' in obj &&
      typeof (obj as GraphQL.Document).url === 'string' &&
      this.tryParseUrl((obj as GraphQL.Document).url as string);

    const schema =
      'data' in obj && '__schema' in (obj as GraphQL.Document).data
        ? (obj as GraphQL.Document).data.__schema
        : undefined;

    const hasRequiredProperties =
      !!schema &&
      typeof schema === 'object' &&
      typeof schema.queryType === 'object' &&
      typeof schema.queryType.name === 'string' &&
      Array.isArray(schema.types);

    return hasValidUrl && hasRequiredProperties;
  }

  private tryParseUrl(url: string): boolean {
    try {
      new URL(url);

      return true;
    } catch {
      // noop
    }

    return false;
  }
}
