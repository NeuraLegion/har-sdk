import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class ArrayFormatter implements Formatter {
  public format(
    error:
      | ErrorObject<'maxItems' | 'minItems', { limit: number }>
      | ErrorObject<'uniqueItems', { i: number; j: number }>
  ): string {
    switch (error.keyword) {
      case 'minItems':
      case 'maxItems':
        return `must have ${
          error.params.limit
        } or ${WordingHelper.getComparison(error.keyword)} items`;

      case 'uniqueItems': {
        const { i, j } = error.params;

        return `must be unique but elements ${j} and ${i} are the same`;
      }
    }
  }
}
