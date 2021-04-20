import { BaseVariableParser } from './BaseVariableParser';
import { Generators } from './Generators';
import { Postman } from '../types/postman';

export class UrlVariableParser extends BaseVariableParser {
  private readonly PATH_VARIABLE_IDENTIFIER = ':';

  constructor(variables: Postman.Variable[], generators: Generators) {
    super(variables, generators);
  }

  public parse(value: string): string {
    if (
      value.startsWith(this.PATH_VARIABLE_IDENTIFIER) &&
      value !== this.PATH_VARIABLE_IDENTIFIER
    ) {
      let variable: Postman.Variable | (() => any) | undefined = this.find(
        this.normalizeKey(value)
      );

      if (variable && typeof variable === 'function') {
        variable = {
          value: variable()?.toString()
        };
      }

      if (
        variable &&
        typeof variable.value === 'string' &&
        variable.value !== 'schema type not provided'
      ) {
        return variable.value;
      }

      return this.sample(variable);
    }

    return value;
  }

  private normalizeKey(token: string): string {
    return token.replace(/^:/, '');
  }
}
