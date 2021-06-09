import { Collection } from '@har-sdk/types';
import { ErrorObject } from 'ajv';

export interface ValidatorResult {
  errors: ErrorObject[];
}

export interface Validator {
  verify(document: Collection.Document): Promise<ValidatorResult>;
}
