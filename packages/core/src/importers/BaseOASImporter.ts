import { BaseImporter } from './BaseImporter';
import { ImporterType } from './ImporterType';
import { FileFormat } from './Importer';
import { OpenAPI } from '../types';

export abstract class BaseOASImporter<
  T extends ImporterType.OASV2 | ImporterType.OASV3
> extends BaseImporter<T> {
  protected constructor() {
    super();
  }

  protected fileName({
    doc,
    format
  }: {
    doc: OpenAPI.Document;
    format: FileFormat;
  }): string {
    return `${[doc.info.title, doc.info.version]
      .map((x: string) => x.trim())
      .join(' ')}.${format}`;
  }
}
