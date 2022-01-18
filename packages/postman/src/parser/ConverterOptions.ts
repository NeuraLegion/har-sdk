import { ParserOptions } from './ParserOptions';

export interface ConverterOptions extends ParserOptions {
  readonly environment?: Record<string, string>;
}
