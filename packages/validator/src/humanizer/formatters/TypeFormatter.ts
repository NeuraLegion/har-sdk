import { Formatter } from './Formatter';
import { WordingHelper } from './WordingHelper';
import { ErrorObject } from 'ajv';

export class TypeFormatter implements Formatter {
  public format(
    error:
      | ErrorObject<'enum', { allowedValues: any[] }>
      | ErrorObject<'type', { type: string | string[] }>
      | ErrorObject<'const', { allowedValue: any }>
  ): string {
    switch (error.keyword) {
      case 'enum': {
        const list = error.params.allowedValues.map((x) => JSON.stringify(x));

        return `must be one of: ${WordingHelper.humanizeList(list, 'or')}`;
      }

      case 'type': {
        const type = error.params.type;
        const list = Array.isArray(type) ? type : type.split(',');
        const expectType = WordingHelper.humanizeList(list, 'or');

        return `must be of type ${expectType}`;
      }

      case 'const': {
        const allowedValue = error.params.allowedValue;

        return Array.isArray(allowedValue)
          ? `must be one of: ${WordingHelper.humanizeList(
              allowedValue.map((x) => JSON.stringify(x)),
              'or'
            )}`
          : `must be equal to constant "${allowedValue}"`;
      }
    }
  }
}
