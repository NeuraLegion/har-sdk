import { CustomSyntaxError } from './CustomSyntaxError';
import { ErrorUnifier } from './ErrorUnifier';

export abstract class BaseErrorUnifier<T extends Error>
  implements ErrorUnifier<T>
{
  private _lineOffsets: number[];

  get lineOffsets(): number[] {
    if (!this._lineOffsets) {
      let offset = 0;
      this._lineOffsets = [
        0,
        ...this.source.split('\n').map((line) => (offset += line.length + 1))
      ];
    }

    return this._lineOffsets;
  }

  protected constructor(private readonly source: string) {}

  protected abstract extractOffset(error: T): number | undefined;

  public toCustomSyntaxError(error: T): CustomSyntaxError {
    return new CustomSyntaxError(
      this.extractMessage(error),
      this.extractOffset(error),
      this.extractSample(error)
    );
  }

  protected extractSample(_error: T): string | undefined {
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
