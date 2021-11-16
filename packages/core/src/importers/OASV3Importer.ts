import { BaseImporter } from './BaseImporter';
import { ImporterType } from './ImporterType';
import { OpenAPIV3 } from '../types';

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

  protected fileName(spec: OpenAPIV3.Document): string | undefined {
    return `${[spec.info.title, spec.info.version]
      .map((x: string) => x.trim())
      .join(' ')}.har`;
  }
}
