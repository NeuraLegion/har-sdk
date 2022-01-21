import { VariableParser } from './VariableParser';
import { Generators } from './generators';
import { Postman } from '@har-sdk/core';

export abstract class BaseVariableParser implements VariableParser {
  private readonly REGEX_DYNAMIC_VARIABLE = /^\$/;

  protected constructor(
    private readonly variables: Postman.Variable[],
    private readonly generators: Generators
  ) {}

  public abstract parse(value: string): string;

  public find(key: string): Postman.Variable | (() => unknown) | undefined {
    let variable: Postman.Variable | undefined = this.variables.find(
      (x: Postman.Variable) => x.key === key
    );

    if (!variable && this.REGEX_DYNAMIC_VARIABLE.test(key)) {
      variable = this.generators[key.replace(this.REGEX_DYNAMIC_VARIABLE, '')];
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
