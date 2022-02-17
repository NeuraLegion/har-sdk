import { ParameterObject } from '../types';
import { isObject, Flattener } from '../utils';

interface SerializationOptions {
  style: string;
  explode: boolean;
}

export class ParamsSerializer {
  private readonly flattener = new Flattener();

  public serializeValue(
    param: ParameterObject,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    value: any,
    oas3: boolean
  ): any {
    const options = this.parseSerializationOptions(param, oas3);
    if (options.explode) {
      return value;
    }

    const delimiter = this.getDelimiter(options.style, oas3);
    if (Array.isArray(value)) {
      return value.join(delimiter);
    } else if (isObject(value)) {
      return this.flattener.toFlattenArray(value).join(delimiter);
    }

    return value;
  }

  private parseSerializationOptions(
    param: ParameterObject,
    oas3: boolean
  ): SerializationOptions {
    if (!oas3 && 'collectionFormat' in param) {
      return {
        style: param.collectionFormat,
        explode: param.collectionFormat === 'multi'
      };
    }

    const { style, explode } = param;

    return { style, explode };
  }

  private getDelimiter(style: string, oas3: boolean): string {
    switch (style) {
      case 'spaceDelimited':
      case 'ssv':
        return ' ';
      case 'tsv':
        return '\t';
      case 'pipeDelimited':
      case 'pipes':
        return '|';
      case 'csv':
      case 'form':
        return ',';
      default:
        return oas3 ? '&' : ',';
    }
  }
}
