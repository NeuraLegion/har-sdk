import { VariableParser } from './VariableParser';
import { Postman } from '../types/postman';

export interface VariableParserFactory {
  createEnvVariableParser(variables: Postman.Variable[]): VariableParser;

  createUrlVariableParser(variables: Postman.Variable[]): VariableParser;
}
