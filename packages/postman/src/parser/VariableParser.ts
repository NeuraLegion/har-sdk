import { Postman } from '@har-sdk/core';

export interface VariableParser {
  find(key: string): Postman.Variable | (() => any) | undefined;

  parse(value: string): string;
}
