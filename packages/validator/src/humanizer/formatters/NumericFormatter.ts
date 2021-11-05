import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

export class NumericFormatter implements Formatter {
  public format(error: ErrorObject): string {
    const { keyword, params } = error;

    switch (keyword) {
      case 'minimum':
      case 'maximum':
      case 'exclusiveMinimum':
      case 'exclusiveMaximum': {
        const direction = keyword.toLowerCase().includes('minimum')
          ? 'greater'
          : 'less';
        const inclusive = !keyword.startsWith('exclusive');

        return `must be${inclusive ? ' equal to or' : ''} ${direction} than ${
          params.limit
        }`;
      }
    }
  }
}
