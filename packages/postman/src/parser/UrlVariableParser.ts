import { BaseVariableParser } from './BaseVariableParser';
import { Generators } from './generators';
import { NoSuchVariable, UnexpectedVariable } from './errors';
import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export class UrlVariableParser extends BaseVariableParser {
  private readonly REGEX_PATH_VARIABLE_IDENTIFIER = /^:/;

  constructor(scope: LexicalScope, generators: Generators) {
    super(scope, generators);
  }

  public parse(value: string): string {
    if (this.REGEX_PATH_VARIABLE_IDENTIFIER.test(value) && value.length > 1) {
      const token = value.replace(this.REGEX_PATH_VARIABLE_IDENTIFIER, '');

      let variable: Postman.Variable | (() => unknown) | undefined =
        this.find(token);

      if (typeof variable === 'function') {
        variable = {
          value: variable()?.toString()
        };
      }

      if (!variable) {
        throw new NoSuchVariable(token, this.scope.jsonPointer);
      }

      // https://github.com/postmanlabs/openapi-to-postman/issues/27
      if (variable.value === 'schema type not provided') {
        throw new UnexpectedVariable(token, this.scope.jsonPointer);
      }

      if (!(variable.value === undefined || variable.value === null)) {
        return variable.value;
      }

      return this.sample(variable);
    }

    return value;
  }
}
