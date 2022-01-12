import { Sampler, OpenAPISchema } from './Sampler';

export class NumberSampler implements Sampler {
  private readonly EPS = 0.001;

  public sample(schema: OpenAPISchema): number {
    const type = schema.type ? schema.type : 'number';
    const integer = type === 'integer';

    let res;
    let usingMaximum = false;
    if ('minimum' in schema) {
      res = this.sampleUsingMinimum(schema, integer);
    } else if ('maximum' in schema) {
      usingMaximum = true;
      res = this.sampleUsingMaximum(schema, integer);
    }

    if (schema.multipleOf) {
      res = this.roundUp(res ?? schema.multipleOf, schema.multipleOf);
      res = usingMaximum ? res - schema.multipleOf : res;
    }

    return this.ensureBoundaries(schema, res ?? 42);
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

  private ensureBoundaries(schema: OpenAPISchema, value: number): number {
    let valid = true;

    if ('minimum' in schema) {
      valid = this.isValidMinimum(schema, value);
    }

    if (valid && 'maximum' in schema) {
      valid = this.isValidMaximum(schema, value);
    }

    if (
      valid &&
      schema.multipleOf &&
      !Number.isInteger(value / schema.multipleOf)
    ) {
      valid = false;
    }

    if (!valid) {
      throw new Error(
        `Cannot sample numeric by boundaries: ${this.formatConditions(schema)}`
      );
    }

    return value;
  }

  private isValidMinimum(schema: OpenAPISchema, value: number): boolean {
    const exclusiveMinimum = !!schema.exclusiveMinimum;

    return exclusiveMinimum ? value > schema.minimum : value >= schema.minimum;
  }

  private isValidMaximum(schema: OpenAPISchema, value: number): boolean {
    const exclusiveMaximum = !!schema.exclusiveMaximum;

    return exclusiveMaximum ? value < schema.maximum : value <= schema.maximum;
  }

  private formatConditions(schema: OpenAPISchema): string {
    let res = '';

    if ('minimum' in schema) {
      const exclusiveMinimum = !!schema.exclusiveMinimum;

      res += `${schema.minimum} ${exclusiveMinimum ? '<' : '<='} `;
    }

    res += 'x';

    if ('maximum' in schema) {
      const exclusiveMaximum = !!schema.exclusiveMaximum;

      res += ` ${exclusiveMaximum ? '<' : '<='} ${schema.maximum}`;
    }

    if ('multipleOf' in schema) {
      res += `, multipleOf: ${schema.multipleOf}`;
    }

    return res;
  }
}
