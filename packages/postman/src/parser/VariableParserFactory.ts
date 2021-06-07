import { VariableParser } from './VariableParser';
import { Postman } from '@har-sdk/types';

export interface VariableParserFactory {
  createEnvVariableParser(variables: Postman.Variable[]): VariableParser;

  createUrlVariableParser(variables: Postman.Variable[]): VariableParser;
}
