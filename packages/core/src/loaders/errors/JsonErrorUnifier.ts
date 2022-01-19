import { BaseErrorUnifier } from './BaseErrorUnifier';
import { ErrorPosition } from './ErrorPosition';

interface PositionedSyntaxError {
  lineNumber: number;
  columnNumber: number;
}

export class JsonErrorUnifier extends BaseErrorUnifier<SyntaxError> {
  // error message from JSON.parse() are different in Firefox and Chrome/node
  // see https://gist.github.com/pmstss/0cf3a26dd3c805389ef583c0279532e7 for details
  private readonly LOCATION_PATTERNS = [
    {
      pattern: /(\d+)$/,
      positionExtractor: (matchRes: RegExpMatchArray): ErrorPosition =>
        +matchRes[1]
    },
    {
      pattern: /at line (\d+) column (\d+)/,
      positionExtractor: (matchRes: RegExpMatchArray): ErrorPosition => ({
        lineNumber: +matchRes[1],
        columnNumber: +matchRes[2]
      })
    }
  ];

  constructor(source: string) {
    super(source);
  }

  protected extractOffset(error: SyntaxError): number | undefined {
    if ('lineNumber' in error && 'columnNumber' in error) {
      const positionedError = error as unknown as PositionedSyntaxError;

      return this.calculateOffset(
        positionedError.lineNumber,
        positionedError.columnNumber
      );
    }

    const { message } = error;

    for (let idx = 0; idx < this.LOCATION_PATTERNS.length; ++idx) {
      const locationPattern = this.LOCATION_PATTERNS[idx];

      const matchRes = message.match(locationPattern.pattern);
      if (matchRes) {
        const position = locationPattern.positionExtractor(matchRes);

        return typeof position === 'number'
          ? position
          : this.calculateOffset(position.lineNumber, position.columnNumber);
      }
    }
  }

  protected extractMessage(error: SyntaxError): string {
    return error.message.replace(/^JSON.parse: /, '');
  }
}
