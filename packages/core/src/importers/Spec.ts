import { ImporterType } from './ImporterType';
import { Har, OpenAPIV2, OpenAPIV3, Postman, GraphQL } from '../types';

export type DocType = `${ImporterType}` | string;

export type Doc<T extends DocType> = T extends ImporterType.OASV2
  ? OpenAPIV2.Document
  : T extends ImporterType.OASV3
  ? OpenAPIV3.Document
  : T extends ImporterType.POSTMAN
  ? Postman.Document
  : T extends ImporterType.GRAPHQL
  ? GraphQL.Document
  : T extends ImporterType.HAR
  ? Har
  : unknown;

export type DocFormat = 'yaml' | 'json';

export interface Spec<TDocType extends DocType, TDoc = Doc<TDocType>> {
  readonly type: TDocType;
  readonly doc: TDoc;
  readonly format: DocFormat;
  readonly name?: string;
}
