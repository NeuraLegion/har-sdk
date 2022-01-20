import { BaseLoader } from './BaseLoader';
import { JsonSyntaxErrorDetailsExtractor } from './errors';

export class JsonLoader extends BaseLoader {
  constructor() {
    super(new JsonSyntaxErrorDetailsExtractor());
  }

  protected parse(): unknown {
    return JSON.parse(this.source);
  }

  protected isSupportedError(error: Error): boolean {
    return error instanceof SyntaxError;
  }
}
