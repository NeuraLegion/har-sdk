import { BaseImporter } from './BaseImporter';
import { ImporterType } from './ImporterType';
import { Har } from '../types';

export class HARImporter extends BaseImporter<ImporterType.HAR> {
  private readonly SUPPORTED_HAR_VERSION = /^1\.\d+$/; // 1.x

  constructor() {
    super();
  }

  get type(): ImporterType.HAR {
    return ImporterType.HAR;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public isSupported(spec: any): spec is Har {
    const version = spec?.log?.version;

    return !!(
      typeof version === 'string' &&
      this.SUPPORTED_HAR_VERSION.test(version.trim()) &&
      Array.isArray(spec.log.entries)
    );
  }
}
