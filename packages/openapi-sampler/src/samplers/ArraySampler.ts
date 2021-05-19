import { Options, Sample, Specification, Traverse } from '../traverse';
import { Sampler, OpenAPISchema } from './Sampler';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

export class ArraySampler implements Sampler {
  constructor(private readonly traverse: Traverse) {}

  public sample(
    schema: OpenAPISchema,
    spec?: Specification,
    options?: Options
  ): any[] {
    let arrayLength = schema.minItems || 1;

    if (this.isItemsExists(schema) && Array.isArray(schema.items)) {
      arrayLength = Math.max(arrayLength, schema.items.length);
    }

    const itemSchemaGetter = (itemNumber: number) => {
      if (this.isItemsExists(schema) && Array.isArray(schema.items)) {
        return schema.items[itemNumber] || {};
      }

      return this.isItemsExists(schema) ? schema.items : {};
    };

    const res: Sample[] = [];

    if (!this.isItemsExists(schema)) {
      return res;
    }

    for (let i = 0; i < arrayLength; i++) {
      const itemSchema = itemSchemaGetter(i);
      res.push(this.traverse.traverse(itemSchema, options, spec).value);
    }

    return res;
  }

  private isItemsExists(
    schema: OpenAPISchema
  ): schema is OpenAPIV2.SchemaObject | OpenAPIV3.ArraySchemaObject {
    return (
      (schema as OpenAPIV2.SchemaObject | OpenAPIV3.ArraySchemaObject).items !==
      undefined
    );
  }
}
