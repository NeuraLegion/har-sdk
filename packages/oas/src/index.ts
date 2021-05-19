import { DefaultValidator } from './validator';
import { Collection, DefaultConverter } from './converter';
import { DefaultLoader } from './loader';
import { Flattener } from './utils/Flattener';
import Har from 'har-format';
import { ok } from 'assert';

export const oas2har = async (
  collection: Collection | string
): Promise<Har.Request[]> => {
  ok(collection, `Please provide a valid OAS Collection.`);

  const validator = new DefaultValidator();
  const loader = new DefaultLoader();
  const flattener = new Flattener();
  const converter: DefaultConverter = new DefaultConverter(
    validator,
    loader,
    flattener
  );

  return converter.convert(collection);
};
