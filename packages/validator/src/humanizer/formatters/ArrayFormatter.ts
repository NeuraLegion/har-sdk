import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

export class ArrayFormatter implements Formatter {
  public format(
    error:
      | ErrorObject<'maxItems' | 'minItems', { limit: number }>
      | ErrorObject<'uniqueItems', { i: number; j: number }>
  ): string {
    switch (error.keyword) {
      case 'minItems':
      case 'maxItems': {
        const direction = error.keyword === 'minItems' ? 'more' : 'fewer';

        return `must have ${error.params.limit} or ${direction} items`;
      }

      case 'uniqueItems': {
        const { i, j } = error.params;

        return `must be unique but elements ${j} and ${i} are the same`;
      }
    }
  }
}
