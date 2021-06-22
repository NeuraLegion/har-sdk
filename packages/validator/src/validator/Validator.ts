import { OpenAPI, Postman } from '@har-sdk/types';
import { ErrorObject } from 'ajv';

export type Document = OpenAPI.Document | Postman.Document;

export interface ValidatorResult {
  errors: Partial<ErrorObject>[];
  valid: boolean;
}

export interface Validator<T extends Document> {
  verify(document: T): Promise<ValidatorResult>;
}
