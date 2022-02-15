import { isObject, Flattener } from '../utils';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export class ParamsSerializer {
  private readonly flattener = new Flattener();

  public serializeValue(
    param: OpenAPIV2.Parameter | OpenAPIV3.ParameterObject,
    value: any,
    oas3: boolean
  ): any {
    const style = oas3
      ? param.style
      : (param as OpenAPIV2.Parameter).collectionFormat;
    const explode = oas3
      ? param.explode
      : (param as OpenAPIV2.Parameter).collectionFormat === 'multi';

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
