import {
  ConverterOptions,
  DefaultConverter,
  DefaultVariableResolver
} from './converter';
import {
  ConstantGenerators,
  DefaultGenerators,
  DefaultVariableParserFactory
} from './parser';
import { Postman, Request } from '@har-sdk/core';

export * from './parser/errors';

export const postman2har = async (
  collection: Postman.Document,
  options: ConverterOptions = {}
): Promise<Request[]> => {
  if (!collection) {
    throw new TypeError('Please provide a valid Postman collection.');
  }

  const generators = options?.dryRun
    ? new ConstantGenerators()
    : new DefaultGenerators();

  const parserFactory = new DefaultVariableParserFactory(generators);
  const varResolver = new DefaultVariableResolver(parserFactory);
  const converter = new DefaultConverter(varResolver, options);

  return converter.convert(collection);
};
