import { Explorer } from './Explorer';
import {
  HARImporter,
  Importer,
  ImporterType,
  OASV2Importer,
  OASV3Importer,
  PostmanImporter,
  Spec
} from '../importers';
import { first } from '../utils';

export class SpecExplorer implements Explorer {
  constructor(
    private readonly importers: ReadonlyArray<Importer<ImporterType>> = [
      new HARImporter(),
      new OASV3Importer(),
      new PostmanImporter(),
      new OASV2Importer()
    ]
  ) {}

  public async tryToImportSpec<T extends ImporterType>(
    value: string
  ): Promise<Spec<T>> {
    let spec: Spec<T> | undefined;

    try {
      const promises = this.importers.map((importer) =>
        importer.importSpec(value)
      );

      spec = (await first(promises, (val) => !!val)) as Spec<T>;
    } catch {
      // noop
    }

    if (!spec) {
      throw new Error('No importers found for the file.');
    }

    return spec;
  }
}
