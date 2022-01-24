import { VariableParserFactory } from './VariableParserFactory';
import { VariableParser } from './VariableParser';
import { EnvVariableParser } from './EnvVariableParser';
import { UrlVariableParser } from './UrlVariableParser';
import { Generators } from './generators';
import { LexicalScope } from './LexicalScope';

export class DefaultVariableParserFactory implements VariableParserFactory {
  constructor(private readonly generators: Generators) {}

  public createEnvVariableParser(scope: LexicalScope): VariableParser {
    return new EnvVariableParser(scope, this.generators);
  }

  public createUrlVariableParser(scope: LexicalScope): VariableParser {
    return new UrlVariableParser(scope, this.generators);
  }
}
