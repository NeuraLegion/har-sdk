import { OAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';

export class NumberSampler implements Sampler {
  private readonly DECIMALS = 2;
  private readonly MAX_VALUE = Number.MAX_SAFE_INTEGER;
  private readonly MIN_VALUE = Number.MIN_SAFE_INTEGER;

  // eslint-disable-next-line complexity
  public sample(schema: OAPISampler.Schema): any {
    const type = schema.type ? schema.type : 'number';
    const isInt = type === 'integer';

    const schemaMin =
      schema.minimum && schema.exclusiveMinimum
        ? schema.minimum + 1
        : schema.minimum;

    const schemaMax =
      schema.maximum && schema.exclusiveMaximum
        ? schema.maximum - 1
        : schema.maximum;

    let min = schemaMin ? schemaMin : this.MIN_VALUE;
    let max = schemaMax ? schemaMax : this.MAX_VALUE;

    if (schema.multipleOf && schema.multipleOf > 0) {
      min = Math.ceil(min / schema.multipleOf) * schema.multipleOf;
      max = Math.floor(max / schema.multipleOf) * schema.multipleOf;
    }

    let sampledNumber;
    if (
      schema.exclusiveMaximum &&
      schema.exclusiveMinimum &&
      Math.abs(min - max) === 1
    ) {
      if (isInt) {
        throw new Error('Invalid min and max boundaries supplied.');
      }
      sampledNumber = (max + min) / 2;
    } else {
      sampledNumber = this.getRandomInt(min, max);
    }

    return this.format(sampledNumber, schema.format);
  }

  private getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private format(num: number, formatString: string): string | number {
    switch (formatString) {
      case 'float':
      case 'double':
        return num.toFixed(this.DECIMALS);
      default:
        return num;
    }
  }
}
