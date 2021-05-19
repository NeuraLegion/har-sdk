import { Postman } from '../postman';

export interface VariableParser {
  find(key: string): Postman.Variable | (() => any) | undefined;

  parse(value: string): string;
}
