import { BaseFormatter } from './BaseFormatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class ArrayFormatter extends BaseFormatter {
  protected readonly supportedKeywords = new Set<string>([
    'maxItems',
    'minItems',
    'uniqueItems'
  ]);

  public format(
    error:
      | ErrorObject<'maxItems' | 'minItems', { limit: number }>
      | ErrorObject<'uniqueItems', { i: number; j: number }>
  ): string {
    const target = WordingHelper.humanizeTarget(error.instancePath);

    switch (error.keyword) {
      case 'minItems':
      case 'maxItems':
        return `${target} must have ${
          error.params.limit
        } or ${WordingHelper.humanizeComparison(error.keyword)} items`;

      case 'uniqueItems': {
        const { i, j } = error.params;

        return `${target} must have unique values, but the elements at indexes ${j} and ${i} are the same`;
      }
    }
  }
}
