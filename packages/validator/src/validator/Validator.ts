import { Collection } from '@har-sdk/types';
import { ErrorObject } from 'ajv';

export interface ValidatorResult {
  errors: Partial<ErrorObject>[];
}

export interface Validator<T extends Collection.Document> {
  verify(document: T): Promise<ValidatorResult>;
}
