import { SyntaxErrorDetails } from './errors';

export interface Loader {
  load(source: string): unknown;
  getSyntaxErrorDetails(): SyntaxErrorDetails | null;
}
