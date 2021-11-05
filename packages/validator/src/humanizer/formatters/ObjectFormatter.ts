import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

export class ObjectFormatter implements Formatter {
  public format(
    error:
      | ErrorObject<'additionalProperties', { additionalProperty: string }>
      | ErrorObject<'required', { missingProperty: string }>
      | ErrorObject<'minProperties' | 'maxProperties', { limit: number }>
  ): string {
    switch (error.keyword) {
      case 'additionalProperties':
        return `has an unexpected property "${error.params.additionalProperty}"`;

      case 'required':
        return `is missing the required field '${error.params.missingProperty}'`;

      case 'minProperties':
      case 'maxProperties': {
        const direction = error.keyword === 'minProperties' ? 'more' : 'fewer';

        return `must have ${error.params.limit} or ${direction} properties`;
      }
    }
  }
}
