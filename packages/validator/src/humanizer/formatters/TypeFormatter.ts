import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class TypeFormatter implements Formatter {
  public supportedKeywords = ['enum', 'type', 'const'];

  public format(
    error:
      | ErrorObject<'enum', { allowedValues: any[] }>
      | ErrorObject<'type', { type: string | string[] }>
      | ErrorObject<'const', { allowedValue: any }>
  ): string {
    const target = WordingHelper.humanizeTarget(error.instancePath);

    switch (error.keyword) {
      case 'enum': {
        const list = error.params.allowedValues.map((x) => JSON.stringify(x));
        const expected = WordingHelper.humanizeList(list, 'or');

        return `${target} must have one of the following values: ${expected}`;
      }

      case 'type': {
        const type = error.params.type;
        const list = (Array.isArray(type) ? type : type.split(',')).map(
          (item) => `\`${item[0].toUpperCase()}${item.slice(1)}\``
        );
        const expected = WordingHelper.humanizeList(list, 'or');

        return `${target} must have a value of type ${expected}`;
      }

      case 'const': {
        const allowedValue = error.params.allowedValue;

        return Array.isArray(allowedValue)
          ? `${target} must be equal to one of the following: ${WordingHelper.humanizeList(
              allowedValue.map((x) => JSON.stringify(x)),
              'or'
            )}`
          : `${target} must be equal to the constant "${allowedValue}"`;
      }
    }
  }
}
