import { ParserOptions } from './ParserOptions';
import { VariableParserFactory } from './VariableParserFactory';
import { VariableParser } from './VariableParser';
import { EnvVariableParser } from './EnvVariableParser';
import { UrlVariableParser } from './UrlVariableParser';
import { Generators } from './generators';
import { Postman } from '@har-sdk/core';

export class DefaultVariableParserFactory implements VariableParserFactory {
  constructor(
    private readonly generators: Generators,
    private readonly options: ParserOptions = {}
  ) {}

  public createEnvVariableParser(
    variables: Postman.Variable[]
  ): VariableParser {
    return new EnvVariableParser(variables, this.generators, this.options);
  }

  public createUrlVariableParser(
    variables: Postman.Variable[]
  ): VariableParser {
    return new UrlVariableParser(variables, this.generators);
  }
}
