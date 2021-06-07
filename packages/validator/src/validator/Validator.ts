import { Collection } from '../collection';

export interface Validator {
  verify(collection: Collection.Document): Promise<void | never>;
}
