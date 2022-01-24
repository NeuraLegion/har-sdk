import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export interface VariableParser {
  scope: LexicalScope;

  find(key: string): Postman.Variable | (() => any) | undefined;

  parse(value: string): string;
}
