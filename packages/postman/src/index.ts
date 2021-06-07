import { DefaultConverter } from './converter';
import { DefaultGenerators, DefaultVariableParserFactory } from './parser';
import { PostmanValidator, Postman } from '@har-sdk/validator';
import Har from 'har-format';
import { ok } from 'assert';

export const postman2har = async (
  collection: Postman.Document,
  options?: {
    environment?: Record<string, string>;
  }
): Promise<Har.Request[]> => {
  ok(collection, `Please provide a valid Postman Collection.`);

  const validator = new PostmanValidator();
  const generators = new DefaultGenerators();
  const parserFactory = new DefaultVariableParserFactory(generators);
  const converter = new DefaultConverter(
    validator,
    parserFactory,
    options ?? {}
  );

  return converter.convert(collection);
};
