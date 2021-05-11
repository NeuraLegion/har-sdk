import { Traverse } from '../traverse';
import { OAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';

export class ArraySampler implements Sampler {
  constructor(private readonly traverse: Traverse) {}

  public sample(
    schema: OAPISampler.Schema,
    spec?: OAPISampler.Specification,
    options?: OAPISampler.Options
  ): any[] {
    let arrayLength = schema.minItems || 1;

    if (Array.isArray(schema.items)) {
      arrayLength = Math.max(arrayLength, schema.items.length);
    }

    const itemSchemaGetter = (itemNumber: number) => {
      if (Array.isArray(schema.items)) {
        return schema.items[itemNumber] || {};
      }

      return schema.items || {};
    };

    const res: any[] = [];

    if (!schema.items) {
      return res;
    }

    for (let i = 0; i < arrayLength; i++) {
      const itemSchema = itemSchemaGetter(i);
      res.push(this.traverse.traverse(itemSchema, options, spec).value);
    }

    return res;
  }
}
