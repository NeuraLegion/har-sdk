import { isObject, Flattener } from '../utils';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export class ParamsSerializer {
  private readonly flattener = new Flattener();

  public serializeValue(
    param: OpenAPIV2.Parameter | OpenAPIV3.ParameterObject,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    value: any,
    oas3: boolean
  ): any {
    let style: string;
    let explode: boolean;

    if (!oas3 && 'collectionFormat' in param) {
      style = param.collectionFormat;
      explode = param.collectionFormat === 'multi';
    } else {
      style = param.style;
      explode = param.explode;
    }

    if (explode) {
      return value;
    }

    const delimiter = this.getDelimiter(style, oas3);
    if (Array.isArray(value)) {
      return value.join(delimiter);
    } else if (isObject(value)) {
      return this.flattener.toFlattenArray(value).join(delimiter);
    }

    return value;
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
