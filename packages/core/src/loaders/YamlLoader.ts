import { BaseLoader } from './BaseLoader';
import { YamlSyntaxErrorDetailsExtractor } from './errors';
import { load, YAMLException } from 'js-yaml';

export class YamlLoader extends BaseLoader {
  constructor() {
    super(new YamlSyntaxErrorDetailsExtractor());
  }

  protected parse(): unknown {
    return load(this.source, { json: true });
  }

  protected isSupportedError(error: Error): boolean {
    return error instanceof YAMLException;
  }
}
