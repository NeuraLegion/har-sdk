import { isObject, Flattener } from '../utils';
import { OpenAPIV2 } from '@har-sdk/core';

export class Oas2ValueSerializer {
  private readonly flattener = new Flattener();

  public serialize(
    param: OpenAPIV2.Parameter,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    value: any
  ): any {
    const style = param.collectionFormat;
    const explode = param.collectionFormat === 'multi';

    if (explode) {
      return value;
    }

    const delimiter = this.getDelimiter(style);
    if (Array.isArray(value)) {
      return value.join(delimiter);
    } else if (isObject(value)) {
      return this.flattener.toFlattenArray(value).join(delimiter);
    }

    return value;
  }

  private getDelimiter(style: string): string {
    switch (style) {
      case 'ssv':
        return ' ';
      case 'tsv':
        return '\t';
      case 'pipes':
        return '|';
      case 'csv':
      default:
        return ',';
    }
  }
}
