import { ConverterOptions, DefaultConverter } from './converter';
import { GraphQL, Request } from '@har-sdk/core';

export { ConverterOptions } from './converter';

export const graphql2har = async (
  doc: GraphQL.Document,
  options: ConverterOptions = {}
): Promise<Request[]> => {
  const converter = new DefaultConverter();

  return converter.convert(doc, options);
};
