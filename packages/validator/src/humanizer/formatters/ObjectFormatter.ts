import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

export class ObjectFormatter implements Formatter {
  public format(error: ErrorObject): string {
    const { keyword, params } = error;

    switch (keyword) {
      case 'additionalProperties': {
        return `has an unexpected property "${params.additionalProperty}"`;
      }

      case 'required': {
        return `is missing the required field '${params.missingProperty}'`;
      }

      case 'minProperties':
      case 'maxProperties': {
        const direction = keyword === 'minProperties' ? 'more' : 'fewer';

        return `must have ${params.limit} or ${direction} properties`;
      }
    }
  }
}
