import { VariableParserFactory } from './VariableParserFactory';
import { VariableParser } from './VariableParser';
import { EnvVariableParser } from './EnvVariableParser';
import { UrlVariableParser } from './UrlVariableParser';
import { Generators } from './generators';

export class DefaultVariableParserFactory implements VariableParserFactory {
  constructor(private readonly generators: Generators) {}

  public createEnvVariableParser(): VariableParser {
    return new EnvVariableParser(this.generators);
  }

  public createUrlVariableParser(): VariableParser {
    return new UrlVariableParser(this.generators);
  }
}
