import { ImporterType } from './ImporterType';
import { OpenAPIV3 } from '../types';
import { BaseOASImporter } from './BaseOASImporter';

export class OASV3Importer extends BaseOASImporter<ImporterType.OASV3> {
  private readonly SUPPORTED_OPENAPI_VERSION = /^3\.0\.\d+$/; // 3.0.x

  constructor() {
    super();
  }

  get type(): ImporterType.OASV3 {
    return ImporterType.OASV3;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public isSupported(spec: any): spec is OpenAPIV3.Document {
    const version = spec?.openapi;

    return (
      typeof version === 'string' &&
      this.SUPPORTED_OPENAPI_VERSION.test(version.trim())
    );
  }
}
