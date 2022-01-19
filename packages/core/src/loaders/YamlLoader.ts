import { CustomSyntaxError, YamlErrorUnifier } from './errors';
import { Loader } from './Loader';
import { load, YAMLException } from 'js-yaml';

export class YamlLoader implements Loader {
  public load(source: string): unknown {
    try {
      return load(source, { json: true });
    } catch (e) {
      throw e instanceof YAMLException
        ? new YamlErrorUnifier(source).toCustomSyntaxError(e)
        : new CustomSyntaxError(e.message);
    }
  }
}
