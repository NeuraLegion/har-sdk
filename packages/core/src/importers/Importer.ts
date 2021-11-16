import { ImporterType } from './ImporterType';
import { OpenAPIV2, OpenAPIV3, Postman, Har } from '../types';

export type FileFormat = 'yaml' | 'json';

export type SpecType<T extends ImporterType> = T extends ImporterType.OASV2
  ? OpenAPIV2.Document
  : T extends ImporterType.OASV3
  ? OpenAPIV3.Document
  : T extends ImporterType.POSTMAN
  ? Postman.Document
  : Har;

export interface Spec<T extends ImporterType> {
  readonly type: T;
  readonly format: FileFormat;
  readonly doc: SpecType<T>;
  readonly name?: string;
}

export interface Importer<T extends ImporterType> {
  type: T;

  isSupported(spec: unknown): spec is SpecType<T>;

  importSpec(content: string): Promise<Spec<T> | undefined>;
}
