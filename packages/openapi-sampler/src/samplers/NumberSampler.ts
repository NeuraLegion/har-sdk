import { Sampler, OpenAPISchema } from './Sampler';

export class NumberSampler implements Sampler {
  private readonly EPS = 0.001;

  public sample(schema: OpenAPISchema): number {
    const type = schema.type ? schema.type : 'number';
    const integer = type === 'integer';

    let res;
    if ('minimum' in schema) {
      res = this.sampleUsingMinimum(schema, integer);
    } else if ('maximum' in schema) {
      res = this.sampleUsingMaximum(schema, integer);
    }

    // TODO proper support for multipleOf with maximum constrain
    if (schema.multipleOf) {
      return this.roundUp(res ?? schema.multipleOf, schema.multipleOf);
    }

    return res ?? 42;

    // if (schema.multipleOf) {
    //   min = Math.ceil(min / schema.multipleOf) * schema.multipleOf;
    //   max = Math.floor(max / schema.multipleOf) * schema.multipleOf;
    // }

    // TODO ensure boundaries
    // throw new Error('Invalid min and max boundaries supplied.');
  }

  private sampleUsingMinimum(schema: OpenAPISchema, integer: boolean): number {
    let exclusiveMinimum = !!schema.exclusiveMinimum;

    let schemaMinimum;
    if (integer && !Number.isInteger(schema.minimum)) {
      schemaMinimum = Math.ceil(schema.minimum);
      exclusiveMinimum = false;
    } else {
      schemaMinimum = schema.minimum;
    }

    return exclusiveMinimum
      ? schemaMinimum + (integer ? 1 : this.EPS)
      : schemaMinimum;
  }

  private sampleUsingMaximum(schema: OpenAPISchema, integer: boolean): number {
    let exclusiveMaximum = !!schema.exclusiveMaximum;

    let schemaMaximum;
    if (integer && !Number.isInteger(schema.maximum)) {
      schemaMaximum = Math.floor(schema.maximum);
      exclusiveMaximum = false;
    } else {
      schemaMaximum = schema.maximum;
    }

    return exclusiveMaximum
      ? schemaMaximum - (integer ? 1 : this.EPS)
      : schemaMaximum;
  }

  private roundUp(value: number, multipleOf: number): number {
    if (!multipleOf || !value) {
      return 0;
    }

    return Math.ceil(value / multipleOf) * multipleOf;
  }
}
