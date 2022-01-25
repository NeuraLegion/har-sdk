import { VariableParser } from './VariableParser';

export interface VariableParserFactory {
  createEnvVariableParser(): VariableParser;

  createUrlVariableParser(): VariableParser;
}
