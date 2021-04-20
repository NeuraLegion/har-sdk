import { DefaultValidator } from './validator';
import { DefaultConverter } from './converter';
import { DefaultGenerators, DefaultVariableParserFactory } from './parser';
import { Postman } from './types/postman';
import Har from 'har-format';
import { ok } from 'assert';

export const postman2har = async (
  collection: Postman.Collection,
  options?: {
    environment?: Record<string, string>;
  }
): Promise<Har.Request[]> => {
  ok(collection, `Please provide a valid Postman Collection.`);

  const validator: DefaultValidator = new DefaultValidator();
  const generators: DefaultGenerators = new DefaultGenerators();
  const parserFactory: DefaultVariableParserFactory = new DefaultVariableParserFactory(
    generators
  );
  const converter: DefaultConverter = new DefaultConverter(
    validator,
    parserFactory,
    options ?? {}
  );

  return converter.convert(collection);
};

export { Postman } from './types/postman';
