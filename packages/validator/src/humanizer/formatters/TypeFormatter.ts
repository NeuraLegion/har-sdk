import { Formatter } from './Formatter';
import { ErrorObject } from 'ajv';

export class TypeFormatter implements Formatter {
  public format(error: ErrorObject): string {
    const { keyword, params } = error;

    switch (keyword) {
      case 'enum': {
        const list = params.allowedValues.map(JSON.stringify);
        const allowed = this.humanizeList(list, 'or');

        return `must be one of: ${allowed}`;
      }

      case 'type': {
        const list = Array.isArray(params.type)
          ? params.type
          : params.type.split(',');
        const expectType = this.humanizeList(list, 'or');

        return `must be of type ${expectType}`;
      }
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
