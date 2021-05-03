import { OpenAPISampler } from '../types/openapi-sampler';
import { Sampler } from './Sampler';

export class ArraySampler extends Sampler {
  public sample(
    schema: OpenAPISampler.Schema,
    spec?: OpenAPISampler.Specification,
    options?: OpenAPISampler.Options
  ): Record<string, any>[] {
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

    const res: Record<string, any>[] = [];

    if (!schema.items) {
      return res;
    }

    for (let i = 0; i < arrayLength; i++) {
      const itemSchema = itemSchemaGetter(i);
      res.push(this.traverse.traverse(itemSchema, options, spec));
    }

    return res;
  }
}
