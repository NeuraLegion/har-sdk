import { ErrorObject } from 'ajv';

export interface Formatter {
  canProcessKeyword(keyword: string): boolean;
  format(error: ErrorObject): string | undefined;
}
