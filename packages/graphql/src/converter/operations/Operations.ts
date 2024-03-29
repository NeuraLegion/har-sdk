import { ConverterOptions } from '../ConverterOptions';
import { type IntrospectionQuery } from '@har-sdk/core';

export interface OperationFile {
  readonly pointer: string;
  readonly content: string;
  readonly contentType: string;
  readonly fileName: string;
}

export interface Operation {
  readonly query: string;
  readonly variables?: object;
  readonly operationName?: string;
  readonly files?: OperationFile[];
}

export interface Operations {
  create(
    introspection: IntrospectionQuery,
    options?: ConverterOptions
  ): Operation[];
}
