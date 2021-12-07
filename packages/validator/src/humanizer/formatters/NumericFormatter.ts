import { BaseFormatter } from './BaseFormatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class NumericFormatter extends BaseFormatter {
  protected readonly supportedKeywords = new Set<string>([
    'minimum',
    'maximum',
    'exclusiveMinimum',
    'exclusiveMaximum'
  ]);

  public format(
    error: ErrorObject<
      'minimum' | 'maximum' | 'exclusiveMinimum' | 'exclusiveMaximum',
      { limit: number }
    >
  ): string {
    const { keyword, params } = error;
    switch (error.keyword) {
      case 'minimum':
      case 'maximum':
      case 'exclusiveMinimum':
      case 'exclusiveMaximum': {
        const direction = keyword.toLowerCase().includes('minimum')
          ? 'greater'
          : 'less';
        const inclusive = !keyword.startsWith('exclusive');

        return `${WordingHelper.humanizeTarget(
          error.instancePath
        )} must have a value${
          inclusive ? ' equal to or' : ''
        } ${direction} than ${params.limit}`;
      }
    }
  }
}
