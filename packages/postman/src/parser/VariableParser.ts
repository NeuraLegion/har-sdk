import { Postman } from '@har-sdk/types';

export interface VariableParser {
  find(key: string): Postman.Variable | (() => any) | undefined;

  parse(value: string): string;
}
