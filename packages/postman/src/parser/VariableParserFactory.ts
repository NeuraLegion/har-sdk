import { VariableParser } from './VariableParser';
import { LexicalScope } from './LexicalScope';

export interface VariableParserFactory {
  createEnvVariableParser(scope: LexicalScope): VariableParser;

  createUrlVariableParser(scope: LexicalScope): VariableParser;
}
