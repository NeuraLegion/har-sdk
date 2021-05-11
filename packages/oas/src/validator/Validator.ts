import { Collection } from '../converter';

export interface Validator {
  verify(collection: Collection): Promise<void | never>;
}
