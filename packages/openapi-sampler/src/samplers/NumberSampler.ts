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

    return res ?? 42;

    // TODO support for multipleOf
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
}
