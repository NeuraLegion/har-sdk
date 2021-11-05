import { ErrorObject } from 'ajv';

export interface Formatter {
  format(error: ErrorObject): string;
}
