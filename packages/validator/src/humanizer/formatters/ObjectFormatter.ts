import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class ObjectFormatter implements Formatter {
  public format(
    error:
      | ErrorObject<'additionalProperties', { additionalProperty: string }>
      | ErrorObject<'required', { missingProperty: string }>
      | ErrorObject<'minProperties' | 'maxProperties', { limit: number }>
  ): string {
    switch (error.keyword) {
      case 'additionalProperties': {
        const props = error.params.additionalProperty;

        return Array.isArray(props)
          ? `has an unexpected properties ${WordingHelper.humanizeList(
              props.map((prop) => `\`${prop}\``)
            )}`
          : `has an unexpected property \`${props}\``;
      }

      case 'required':
        return `is missing the required field \`${error.params.missingProperty}\``;

      case 'minProperties':
      case 'maxProperties':
        return `must have ${
          error.params.limit
        } or ${WordingHelper.getComparison(error.keyword)} properties`;
    }
  }
}
