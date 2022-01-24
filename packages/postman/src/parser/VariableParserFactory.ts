import { VariableParser } from './VariableParser';
import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export interface VariableParserFactory {
  createEnvVariableParser(
    scopeOrVariables: LexicalScope | Postman.Variable[]
  ): VariableParser;

  createUrlVariableParser(variables: Postman.Variable[]): VariableParser;
}
