import { BaseImporter } from './BaseImporter';
import { ImporterType } from './ImporterType';
import { OpenAPIV2 } from '../types';

export class OASV2Importer extends BaseImporter<ImporterType.OASV2> {
  private readonly SUPPORTED_SWAGGER_VERSION = '2.0';

  constructor() {
    super();
  }

  get type(): ImporterType.OASV2 {
    return ImporterType.OASV2;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public isSupported(spec: any): spec is OpenAPIV2.Document {
    return spec?.swagger?.trim() === this.SUPPORTED_SWAGGER_VERSION;
  }

  protected fileName(spec: OpenAPIV2.Document): string {
    return `${[spec.info.title, spec.info.version]
      .map((x: string) => x.trim())
      .join(' ')}.har`;
  }
}
