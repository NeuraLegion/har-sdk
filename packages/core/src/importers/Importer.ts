import { Doc, DocType, Spec, DocFormat } from './Spec';

export interface Importer<TDocType extends DocType, TDoc = Doc<TDocType>> {
  import(
    content: string,
    format?: DocFormat
  ): Promise<Spec<TDocType, TDoc> | undefined>;
}
