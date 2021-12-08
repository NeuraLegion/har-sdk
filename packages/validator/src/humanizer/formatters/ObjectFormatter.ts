import { BaseFormatter } from './BaseFormatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class ObjectFormatter extends BaseFormatter {
  protected readonly supportedKeywords = new Set<string>([
    'additionalProperties',
    'required',
    'minProperties',
    'maxProperties'
  ]);

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
        return `${WordingHelper.humanizeTarget(error.instancePath)} must have ${
          error.params.limit
        } or ${WordingHelper.humanizeComparison(error.keyword)} properties`;
      }
    }
  }
}
