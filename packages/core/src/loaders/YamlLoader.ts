import { Loader } from './Loader';
import { load } from 'js-yaml';

export class YamlLoader implements Loader {
  public load(source: string): unknown {
    return load(source, { json: true });
  }
}
