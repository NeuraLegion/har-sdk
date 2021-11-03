import { OpenAPI, Postman } from '@har-sdk/types';
import { ErrorObject } from 'ajv';

export type Document = OpenAPI.Document | Postman.Document;

export interface Validator<T extends Document> {
  validate(document: T): Promise<ErrorObject[]>;
}
