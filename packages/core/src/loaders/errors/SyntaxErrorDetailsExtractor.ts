import { SyntaxErrorDetails } from './SyntaxErrorDetails';

export interface SyntaxErrorDetailsExtractor {
  extract(error: Error, source: string): SyntaxErrorDetails;
}
