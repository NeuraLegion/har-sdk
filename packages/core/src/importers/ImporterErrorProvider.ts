import { SyntaxErrorDetails } from '../loaders';
import { DocFormat } from './Spec';

export interface ImporterErrorProvider {
  getErrorDetails(format: DocFormat): SyntaxErrorDetails | undefined;
}
