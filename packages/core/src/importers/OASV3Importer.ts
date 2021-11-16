import { BaseImporter } from './BaseImporter';
import { ImporterType } from './ImporterType';
import { OpenAPIV3 } from '../types';
import { FileFormat } from './Importer';

export class OASV3Importer extends BaseImporter<ImporterType.OASV3> {
  private readonly SUPPORTED_OPENAPI_VERSION = /^3\.\d+\.\d+$/; // 3.x.x

  constructor() {
    super();
  }

  get type(): ImporterType.OASV3 {
    return ImporterType.OASV3;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public isSupported(spec: any): spec is OpenAPIV3.Document {
    return !!(
      spec?.openapi && this.SUPPORTED_OPENAPI_VERSION.test(spec.openapi)
    );
  }

  protected fileName({
    doc,
    format
  }: {
    doc: OpenAPIV3.Document;
    format: FileFormat;
  }): string | undefined {
    return `${[doc.info.title, doc.info.version]
      .map((x: string) => x.trim())
      .join(' ')}.${format}`;
  }
}
