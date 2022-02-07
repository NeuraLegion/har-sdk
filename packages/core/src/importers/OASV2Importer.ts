import { ImporterType } from './ImporterType';
import { OpenAPIV2 } from '../types';
import { BaseOASImporter } from './BaseOASImporter';

export class OASV2Importer extends BaseOASImporter<ImporterType.OASV2> {
  private readonly SUPPORTED_SWAGGER_VERSION = '2.0';

  constructor() {
    super();
  }

  get type(): ImporterType.OASV2 {
    return ImporterType.OASV2;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public isSupported(spec: any): spec is OpenAPIV2.Document {
    const version = spec?.swagger;

    return (
      typeof version === 'string' &&
      version.trim() === this.SUPPORTED_SWAGGER_VERSION
    );
  }
}
