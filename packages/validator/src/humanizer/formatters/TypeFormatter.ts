import { Formatter } from './Formatter';
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

        return `must be one of: ${this.humanizeList(list, 'or')}`;
      }

      case 'type': {
        const type = error.params.type;
        const list = Array.isArray(type) ? type : type.split(',');
        const expectType = this.humanizeList(list, 'or');

        return `must be of type ${expectType}`;
      }

      case 'const':
        return `must be equal to constant "${error.params.allowedValue}"`;
    }
  }

  private humanizeList(arr: string[], conjunction = 'and'): string {
    if (arr.length === 0) {
      return 'nothing';
    }
    if (arr.length === 1) {
      return arr[0];
    }
    if (arr.length === 2) {
      return `${arr[0]} ${conjunction} ${arr[1]}`;
    }

    return `${arr.slice(0, -1).join(', ')}, ${conjunction} ${
      arr[arr.length - 1]
    }`;
  }
}
