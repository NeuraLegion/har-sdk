import { Har, OpenAPI, Postman } from '@har-sdk/types';
import { ErrorObject } from 'ajv';

export type Document = OpenAPI.Document | Postman.Document | Har;

export interface Validator<T extends Document> {
  verify(document: T): Promise<ErrorObject[]>;
}
