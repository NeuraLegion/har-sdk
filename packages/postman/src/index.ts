import { DefaultConverter } from './converter';
import { DefaultGenerators, DefaultVariableParserFactory } from './parser';
import { Postman, Request } from '@har-sdk/types';

export const postman2har = async (
  collection: Postman.Document,
  options?: {
    environment?: Record<string, string>;
  }
): Promise<Request[]> => {
  if (!collection) {
    throw new TypeError('Please provide a valid Postman collection.');
  }

  const generators = new DefaultGenerators();
  const parserFactory = new DefaultVariableParserFactory(generators);
  const converter = new DefaultConverter(parserFactory, options ?? {});

  return converter.convert(collection);
};
