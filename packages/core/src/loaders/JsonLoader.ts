import { Loader } from './Loader';

export class JsonLoader implements Loader {
  public load(source: string): unknown {
    return JSON.parse(source);
  }
}
