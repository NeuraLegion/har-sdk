import { BaseImporter } from './BaseImporter';
import { OpenAPI } from '../types';
import { DocFormat } from './Spec';
import { ImporterType } from './ImporterType';

export abstract class BaseOASImporter<
  TDocType extends ImporterType.OASV2 | ImporterType.OASV3
> extends BaseImporter<TDocType> {
  protected constructor() {
    super();
  }

  protected fileName({
    doc,
    format
  }: {
    doc: OpenAPI.Document;
    format: DocFormat;
  }): string | undefined {
    if (
      typeof doc?.info?.title === 'string' &&
      typeof doc.info.version === 'string'
    ) {
      return `${[doc.info.title, doc.info.version]
        .map((x: string) => x.trim())
        .join(' ')}.${format}`;
    }
  }
}
