import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

export class ArrayFormatter implements Formatter {
  public format(error: ErrorObject): string {
    const { keyword, params } = error;

    switch (keyword) {
      case 'minItems':
      case 'maxItems': {
        const direction = keyword === 'minItems' ? 'more' : 'fewer';

        return `must have ${params.limit} or ${direction} items`;
      }

      case 'uniqueItems': {
        const { i, j } = params;

        return `must be unique but elements ${j} and ${i} are the same`;
      }
    }
  }
}
