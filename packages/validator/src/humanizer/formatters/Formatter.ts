import { ErrorObject } from 'ajv';

export interface Formatter {
  supportedKeywords: ReadonlyArray<string>;

  format(error: ErrorObject): string | undefined;
}
