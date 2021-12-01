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
          ? `The properties ${WordingHelper.humanizeList(
              props.map((prop) => `\`${prop}\``)
            )} are unexpected`
          : `The property \`${props}\` is unexpected`;
      }

      case 'required':
        return `The property \`${error.params.missingProperty}\` is required`;

      case 'minProperties':
      case 'maxProperties': {
        const propName = WordingHelper.extractPropertyName(error.instancePath);

        return `The property \`${propName}\` must have ${
          error.params.limit
        } or ${WordingHelper.getComparison(error.keyword)} properties`;
      }
    }
  }
}
