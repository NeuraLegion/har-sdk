import { SpecTreeNode } from '../models';
import { DocFormat, OpenAPI, Postman } from '@har-sdk/core';

export type Document = OpenAPI.Document | Postman.Document;

export interface TreeParser<T extends Document = Document> {
  doc: T | undefined;
  format: DocFormat | undefined;
  setup(source: string, format?: DocFormat): Promise<void>;
  parse(): SpecTreeNode;
  stringify(): string;
}
