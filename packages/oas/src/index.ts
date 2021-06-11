import { DefaultConverter } from './converter';
import { Flattener } from './utils/Flattener';
import { OASValidator } from '@har-sdk/validator';
import { OpenAPI } from '@har-sdk/types';
import Har from 'har-format';
import { ok } from 'assert';

export const oas2har = async (
  collection: OpenAPI.Document
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
