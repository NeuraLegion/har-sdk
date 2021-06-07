import { DefaultConverter } from './converter';
import { Flattener } from './utils/Flattener';
import { OASValidator, OAS } from '@har-sdk/validator';
import Har from 'har-format';
import { ok } from 'assert';

export const oas2har = async (
  collection: OAS.Document
): Promise<Har.Request[]> => {
  ok(collection, `Please provide a valid OAS Collection.`);

  const validator = new OASValidator();
  const flattener = new Flattener();
  const converter: DefaultConverter = new DefaultConverter(
    validator,
    flattener
  );

  return converter.convert(collection);
};
