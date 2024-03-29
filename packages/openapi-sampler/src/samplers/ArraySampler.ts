import { Options, Sample, Specification, Traverse } from '../traverse';
import { Sampler, OpenAPISchema } from './Sampler';
import { hasItems } from '../utils';

export class ArraySampler implements Sampler {
  constructor(private readonly traverse: Traverse) {}

  public sample(
    schema: OpenAPISchema,
    spec?: Specification,
    options?: Options
  ): any[] {
    let arrayLength = schema.minItems || 1;

    if (hasItems(schema) && Array.isArray(schema.items)) {
      arrayLength = Math.max(arrayLength, schema.items.length);
    }

    const itemSchemaGetter = (itemNumber: number) => {
      if (hasItems(schema) && Array.isArray(schema.items)) {
        return schema.items[itemNumber] || {};
      }

      return hasItems(schema) ? schema.items : {};
    };

    const res: Sample[] = [];

    if (!hasItems(schema)) {
      return res;
    }

    for (let i = 0; i < arrayLength; i++) {
      const itemSchema = itemSchemaGetter(i);
      res.push(this.traverse.traverse(itemSchema, options, spec).value);
    }

    return res;
  }
}
