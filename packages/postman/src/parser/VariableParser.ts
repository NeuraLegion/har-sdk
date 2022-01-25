import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export interface VariableParser {
  find(
    key: string,
    scope: LexicalScope
  ): Postman.Variable | (() => any) | undefined;

  parse(value: string, scope: LexicalScope): string;
}
