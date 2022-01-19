import { CustomSyntaxError } from './CustomSyntaxError';

export interface ErrorUnifier<T> {
  toCustomSyntaxError(e: T, source: string): CustomSyntaxError;
}
