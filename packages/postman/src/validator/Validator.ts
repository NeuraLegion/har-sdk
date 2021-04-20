import { Postman } from '../types/postman';

export interface Validator {
  verify(collection: Postman.Collection): Promise<void | never>;
}
