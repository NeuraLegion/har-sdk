import { ImporterType, Spec } from '../importers';

export interface Explorer {
  tryToImportSpec<T extends ImporterType>(value: string): Promise<Spec<T>>;
}
