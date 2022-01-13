import { DocFormat } from '../importers';
import { JsonLoader } from './JsonLoader';
import { Loader } from './Loader';
import { YamlLoader } from './YamlLoader';

export class LoaderFactory {
  public getLoader(format: DocFormat): Loader {
    switch (format) {
      case 'json':
        return new JsonLoader();
      case 'yaml':
        return new YamlLoader();
    }
  }
}
