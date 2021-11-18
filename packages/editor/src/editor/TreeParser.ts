import { SpecTreeNode } from '../models';
import { OpenAPI, Postman } from '@har-sdk/types';

export type Document = OpenAPI.Document | Postman.Document;

export interface TreeParser<T extends Document = Document> {
  doc: T | undefined;
  setup(source: string): Promise<void>;
  parse(): SpecTreeNode;
  stringify(): string;
}
