import { DefaultConverter } from './converter';
import {
  ConstantGenerators,
  DefaultGenerators,
  DefaultVariableParserFactory,
  ConverterOptions
} from './parser';
import { Postman, Request } from '@har-sdk/core';

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
  const parserFactory = new DefaultVariableParserFactory(generators, {
    dryRun: !!options.dryRun
  });
  const converter = new DefaultConverter(parserFactory, options);

  return converter.convert(collection);
};
