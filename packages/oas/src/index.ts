import { DefaultValidator } from './validator';
import { DefaultConverter } from './converter';
import { OAS } from './types/oas';
import { DefaultLoader } from './loader';
import Har from 'har-format';
import { ok } from 'assert';

export const oas2har = async (
  collection: OAS.Collection
): Promise<Har.Request[]> => {
  ok(collection, `Please provide a valid OAS Collection.`);

  const validator: DefaultValidator = new DefaultValidator();
  const loader: DefaultLoader = new DefaultLoader();
  const converter: DefaultConverter = new DefaultConverter(validator, loader);

  return converter.convert(collection);
};

export { OAS } from './types/oas';
