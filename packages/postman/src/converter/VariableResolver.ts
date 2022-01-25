import { LexicalScope } from '../parser';
import { Postman } from '@har-sdk/core';

export interface VariableResolver {
  resolve(root: Postman.Request, scope: LexicalScope): Postman.Request;
}
