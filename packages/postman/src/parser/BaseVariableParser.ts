import { VariableParser } from './VariableParser';
import { Generators } from './Generators';
import { Postman } from '../types/postman';

export abstract class BaseVariableParser implements VariableParser {
  protected constructor(
    private readonly variables: Postman.Variable[],
    private readonly generators: Generators
  ) {}

  public abstract parse(value: string): string;

  public find(key: string): Postman.Variable | (() => any) | undefined {
    const variable: Postman.Variable | undefined = this.variables.find(
      (x: Postman.Variable) => x.key === key
    );

    if (!variable && key.startsWith('$')) {
      return this.generators[key.replace(/^\$/, '')];
    }

    return variable;
  }

  protected sample(variable?: Postman.Variable): string {
    switch (variable?.type?.toLowerCase()) {
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
