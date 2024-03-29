import { ConverterOptions } from './ConverterOptions';
import { GraphQL, Request } from '@har-sdk/core';

export interface Converter {
  convert(
    envelope: GraphQL.Document,
    options: ConverterOptions
  ): Promise<Request[]>;
}
