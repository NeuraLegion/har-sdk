import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class NumericFormatter implements Formatter {
  public format(
    error: ErrorObject<
      'minimum' | 'maximum' | 'exclusiveMinimum' | 'exclusiveMaximum',
      { limit: number }
    >
  ): string {
    const { keyword, params } = error;
    const propName = WordingHelper.extractPropertyName(error.instancePath);

    switch (error.keyword) {
      case 'minimum':
      case 'maximum':
      case 'exclusiveMinimum':
      case 'exclusiveMaximum': {
        const direction = keyword.toLowerCase().includes('minimum')
          ? 'greater'
          : 'less';
        const inclusive = !keyword.startsWith('exclusive');

        return `The property \`${propName}\` must have a value${
          inclusive ? ' equal to or' : ''
        } ${direction} than ${params.limit}`;
      }
    }
  }
}
