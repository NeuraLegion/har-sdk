import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class ArrayFormatter implements Formatter {
  public format(
    error:
      | ErrorObject<'maxItems' | 'minItems', { limit: number }>
      | ErrorObject<'uniqueItems', { i: number; j: number }>
  ): string {
    const propName = WordingHelper.extractPropertyName(error.instancePath);

    switch (error.keyword) {
      case 'minItems':
      case 'maxItems':
        return `The property \`${propName}\` must have ${
          error.params.limit
        } or ${WordingHelper.getComparison(error.keyword)} items`;

      case 'uniqueItems': {
        const { i, j } = error.params;

        return `The property \`${propName}\` must have unique values, but there are the same elements at indexes ${j} and ${i}`;
      }
    }
  }
}
