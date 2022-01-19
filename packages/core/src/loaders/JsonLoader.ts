import { JsonErrorUnifier, CustomSyntaxError } from './errors';
import { Loader } from './Loader';

export class JsonLoader implements Loader {
  public load(source: string): unknown {
    try {
      return JSON.parse(source);
    } catch (e) {
      throw e instanceof SyntaxError
        ? new JsonErrorUnifier(source).toCustomSyntaxError(e)
        : new CustomSyntaxError(e.message);
    }
  }
}
