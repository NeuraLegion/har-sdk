import { DefaultConverter } from './converter';
import {
  DefaultGenerators,
  DefaultVariableParserFactory,
  ConstantGenerators
} from './parser';
import { Postman, Request } from '@har-sdk/core';

export const postman2har = async (
  collection: Postman.Document,
  options?: {
    environment?: Record<string, string>;
    dryRun?: boolean;
  }
): Promise<Request[]> => {
  if (!collection) {
    throw new TypeError('Please provide a valid Postman collection.');
  }

  const generators = options?.dryRun
    ? new ConstantGenerators()
    : new DefaultGenerators();
  const parserFactory = new DefaultVariableParserFactory(generators);
  const converter = new DefaultConverter(parserFactory, options ?? {});

  return converter.convert(collection);
};
