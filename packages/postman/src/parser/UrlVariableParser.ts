import { BaseVariableParser } from './BaseVariableParser';
import { Generators } from './generators';
import { NoSuchVariable, UnexpectedVariable } from './errors';
import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export class UrlVariableParser extends BaseVariableParser {
  private readonly REGEX_PATH_VARIABLE_IDENTIFIER = /^:/;

  constructor(generators: Generators) {
    super(generators);
  }

  public parse(value: string, scope: LexicalScope): string {
    if (this.REGEX_PATH_VARIABLE_IDENTIFIER.test(value) && value.length > 1) {
      const token = value.replace(this.REGEX_PATH_VARIABLE_IDENTIFIER, '');

      const variable: Postman.Variable | undefined = this.find(token, scope);

      if (!variable) {
        throw new NoSuchVariable(token, scope.jsonPointer);
      }

      // https://github.com/postmanlabs/openapi-to-postman/issues/27
      if (variable.value === 'schema type not provided') {
        throw new UnexpectedVariable(token, scope.jsonPointer);
      }

      if (!(variable.value === undefined || variable.value === null)) {
        return variable.value;
      }

      return this.sample(variable);
    }

    return value;
  }
}
