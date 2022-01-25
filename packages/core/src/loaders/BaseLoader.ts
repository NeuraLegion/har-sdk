import { SyntaxErrorDetails, SyntaxErrorDetailsExtractor } from './errors';
import { Loader } from './Loader';

export abstract class BaseLoader implements Loader {
  protected source: string;
  private error: Error;

  protected constructor(
    private readonly syntaxErrorDetailsExtractor: SyntaxErrorDetailsExtractor
  ) {}

  protected abstract parse(): unknown;
  protected abstract isSupportedError(error: Error): boolean;

  public load(source: string): unknown {
    this.source = source;
    this.error = undefined;

    try {
      return this.parse();
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.error = e;
      }
      throw e;
    }
  }

  public getSyntaxErrorDetails(): SyntaxErrorDetails {
    return (
      this.error &&
      (this.isSupportedError(this.error)
        ? this.syntaxErrorDetailsExtractor.extract(this.error, this.source)
        : { message: this.error.message })
    );
  }
}
