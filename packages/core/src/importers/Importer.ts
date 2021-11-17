import { Doc, DocType, Spec } from './Spec';

export interface Importer<TDocType extends DocType, TDoc = Doc<TDocType>> {
  import(content: string): Promise<Spec<TDocType, TDoc> | undefined>;
}
