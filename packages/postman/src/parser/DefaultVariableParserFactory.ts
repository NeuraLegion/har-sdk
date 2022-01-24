import { VariableParserFactory } from './VariableParserFactory';
import { VariableParser } from './VariableParser';
import { EnvVariableParser } from './EnvVariableParser';
import { UrlVariableParser } from './UrlVariableParser';
import { Generators } from './generators';
import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export class DefaultVariableParserFactory implements VariableParserFactory {
  constructor(private readonly generators: Generators) {}

  public createEnvVariableParser(
    scopeOrVariables: LexicalScope | Postman.Variable[]
  ): VariableParser {
    return new EnvVariableParser(
      Array.isArray(scopeOrVariables)
        ? scopeOrVariables
        : [...scopeOrVariables.variables],
      this.generators
    );
  }

  public createUrlVariableParser(
    variables: Postman.Variable[]
  ): VariableParser {
    return new UrlVariableParser(variables, this.generators);
  }
}
