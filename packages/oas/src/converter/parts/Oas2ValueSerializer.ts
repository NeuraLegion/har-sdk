import { ConvertError } from '../../errors';
import { isObject, Flattener } from '../../utils';
import { OpenAPIV2 } from '@har-sdk/core';

export class Oas2ValueSerializer {
  private readonly flattener = new Flattener();

  public serialize(
    param: OpenAPIV2.Parameter,
    value: unknown,
    jsonPointer: string
  ): unknown {
    const style = param.collectionFormat;
    const explode = param.collectionFormat === 'multi';

    if (explode && param.in !== 'formData' && param.in !== 'query') {
      throw new ConvertError(
        'Collection format `multi` is allowed only for `formData` and `query` parameters',
        jsonPointer
      );
    }

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

  public toFlattenObject(
    obj: Record<string, any>,
    options?: Record<string, any>
  ): Record<string, any> {
    return this.flattener.toFlattenObject(obj, options);
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
