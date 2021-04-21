import { OAS } from '../types/oas';

export interface Validator {
  verify(collection: OAS.Collection): Promise<void | never>;
}
