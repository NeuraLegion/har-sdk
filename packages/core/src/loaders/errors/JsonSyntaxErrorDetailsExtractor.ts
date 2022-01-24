import { BaseSyntaxErrorDetailsExtractor } from './BaseSyntaxErrorDetailsExtractor';
import { ErrorPosition } from './ErrorPosition';

interface PositionedSyntaxError {
  lineNumber: number;
  columnNumber: number;
}

export class JsonSyntaxErrorDetailsExtractor extends BaseSyntaxErrorDetailsExtractor<SyntaxError> {
  // error message from JSON.parse() are different in Firefox and Chrome/node
  // see https://gist.github.com/pmstss/0cf3a26dd3c805389ef583c0279532e7 for details
  private readonly LOCATION_PATTERNS = [
    {
      pattern: /at position (\d+)$/,
      positionExtractor: (matchRes: RegExpMatchArray): ErrorPosition =>
        +matchRes[1]
    },
    {
      pattern: /at line (\d+) column (\d+)/,
      positionExtractor: ([, line, column]: RegExpMatchArray): ErrorPosition => ({
        lineNumber: +line,
        columnNumber: +column
      })
    }
  ];

  protected extractOffset(error: SyntaxError): number | undefined {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/lineNumber
    const position =
      'lineNumber' in error && 'columnNumber' in error
        ? (error as unknown as PositionedSyntaxError)
        : this.extractByLocationPatterns(error.message);

    return typeof position === 'number'
      ? position
      : position &&
          this.calculateOffset(position.lineNumber, position.columnNumber);
  }

  protected extractMessage(error: SyntaxError): string {
    return error.message
      .replace(/^JSON.parse: /, '')
      .replace(/ at line \d+ column \d+ of the JSON data$/, '')
      .replace(/ at position \d+$/, '');
  }

  private extractByLocationPatterns(
    message: string
  ): number | ErrorPosition | undefined {
    for (let idx = 0; idx < this.LOCATION_PATTERNS.length; ++idx) {
      const locationPattern = this.LOCATION_PATTERNS[idx];

      const matchRes = message.match(locationPattern.pattern);
      if (matchRes) {
        return locationPattern.positionExtractor(matchRes);
      }
    }
  }
}
