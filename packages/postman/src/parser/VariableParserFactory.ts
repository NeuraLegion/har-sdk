import { VariableParser } from './VariableParser';
import { Postman } from '@har-sdk/validator';

export interface VariableParserFactory {
  createEnvVariableParser(variables: Postman.Variable[]): VariableParser;

  createUrlVariableParser(variables: Postman.Variable[]): VariableParser;
}
