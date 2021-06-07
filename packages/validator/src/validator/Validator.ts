import { Collection } from '@har-sdk/types';

export interface Validator {
  verify(collection: Collection.Document): Promise<void | never>;
}
