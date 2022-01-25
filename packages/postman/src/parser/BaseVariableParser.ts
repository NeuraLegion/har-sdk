import { VariableParser } from './VariableParser';
import { Generators } from './generators';
import { LexicalScope } from './LexicalScope';
import { Postman } from '@har-sdk/core';

export abstract class BaseVariableParser implements VariableParser {
  private readonly REGEX_DYNAMIC_VARIABLE = /^\$/;

  protected constructor(private readonly generators: Generators) {}

  public abstract parse(value: string, scope: LexicalScope): string;

  public find(key: string, scope: LexicalScope): Postman.Variable | undefined {
    let variable: Postman.Variable | (() => unknown) | undefined = scope.find(
      (x: Postman.Variable) => x.key === key
    );

    if (!variable && this.REGEX_DYNAMIC_VARIABLE.test(key)) {
      variable = this.generators[key.replace(this.REGEX_DYNAMIC_VARIABLE, '')];
    }

    if (typeof variable === 'function') {
      variable = {
        value: variable()?.toString()
      };
    }

    return variable;
  }

  protected sample(variable: Postman.Variable): string {
    switch (variable.type?.toLowerCase()) {
      case 'string':
      case 'text':
        return this.generators.randomWord();
      case 'number':
        return String(this.generators.randomInt());
      case 'any':
      default:
        return this.generators.randomAlphaNumeric();
    }
  }
}
