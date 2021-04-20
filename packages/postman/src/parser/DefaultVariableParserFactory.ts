import { VariableParserFactory } from './VariableParserFactory';
import { VariableParser } from './VariableParser';
import { EnvVariableParser } from './EnvVariableParser';
import { UrlVariableParser } from './UrlVariableParser';
import { Generators } from './Generators';
import { Postman } from '../types/postman';

export class DefaultVariableParserFactory implements VariableParserFactory {
  constructor(private readonly generators: Generators) {}

  public createEnvVariableParser(
    variables: Postman.Variable[]
  ): VariableParser {
    return new EnvVariableParser(variables, this.generators);
  }

  public createUrlVariableParser(
    variables: Postman.Variable[]
  ): VariableParser {
    return new UrlVariableParser(variables, this.generators);
  }
}
