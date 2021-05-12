import { Postman } from '../postman';

export interface Validator {
  verify(collection: Postman.Collection): Promise<void | never>;
}
