import { Doc, DocType, Spec } from './Spec';
import { Importer } from './Importer';
import { first } from '../utils';
import { OASV3Importer } from './OASV3Importer';
import { PostmanImporter } from './PostmanImporter';
import { OASV2Importer } from './OASV2Importer';
import { HARImporter } from './HARImporter';

export class SpecImporter implements Importer<DocType> {
  constructor(
    private readonly importers: ReadonlyArray<Importer<DocType>> = [
      new HARImporter(),
      new OASV3Importer(),
      new PostmanImporter(),
      new OASV2Importer()
    ]
  ) {}

  public import<TDocType extends DocType, TDoc = Doc<TDocType>>(
    value: string
  ): Promise<Spec<TDocType, TDoc> | undefined>;
  public async import(value: string): Promise<Spec<DocType> | undefined> {
    let spec: Spec<DocType> | undefined;

    try {
      const promises = this.importers.map((importer) => importer.import(value));

      spec = await first(promises, (val) => !!val);
    } catch {
      // noop
    }

    return spec;
  }
}
