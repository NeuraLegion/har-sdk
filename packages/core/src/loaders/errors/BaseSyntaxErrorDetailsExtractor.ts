import { SyntaxErrorDetails } from './SyntaxErrorDetails';
import { SyntaxErrorDetailsExtractor } from './SyntaxErrorDetailsExtractor';

export abstract class BaseSyntaxErrorDetailsExtractor<T extends Error>
  implements SyntaxErrorDetailsExtractor
{
  private source: string;
  private _lineOffsets: number[];

  get lineOffsets(): number[] {
    if (!this._lineOffsets) {
      let offset = 0;
      this._lineOffsets = [
        0,
        ...(this.source || '')
          .split('\n')
          .map((line) => (offset += line.length + 1))
      ];
    }

    return this._lineOffsets;
  }

  protected abstract extractOffset(error: T): number | undefined;

  public extract(error: T, source: string): SyntaxErrorDetails {
    this.source = source;
    this._lineOffsets = undefined;

    const message = this.extractMessage(error);
    const offset = this.extractOffset(error);
    const snippet = this.extractSnippet(error);

    return {
      message,
      ...(offset !== undefined ? { offset } : {}),
      ...(snippet !== undefined ? { snippet } : {})
    };
  }

  protected extractSnippet(_error: T): string | undefined {
    return undefined;
  }

  protected extractMessage(error: T): string {
    return error.message;
  }

  protected calculateOffset(lineNumber: number, columnNumber: number): number {
    return lineNumber <= this.lineOffsets.length
      ? this.lineOffsets[lineNumber - 1] + columnNumber - 1
      : this.source.length;
  }
}
