import { Schema } from './Traverse';
import { VendorExtensions } from '../VendorExtensions';

export class VendorExamples {
  public find(schema: Schema) {
    const example =
      schema[VendorExtensions.X_EXAMPLE] ?? schema[VendorExtensions.X_EXAMPLES];

    const matchingSchema = this.getMatchingSchema(schema);
    const isPrimitiveType = 0 === matchingSchema.keys.length;

    if (!example || typeof example !== 'object' || isPrimitiveType) {
      return example;
    }

    return this.traverse(example, matchingSchema);
  }

  private getMatchingSchema(
    schema: Schema,
    depth: number = 0
  ): { depth: number; keys: string[] } {
    if ('items' in schema) {
      return this.getMatchingSchema(schema.items, 1 + depth);
    }

    return {
      depth,
      keys:
        'properties' in schema && schema.properties
          ? Object.keys(schema.properties)
          : []
    };
  }

  private traverse(
    example: unknown,
    matchingSchema: { depth: number; keys: string[] },
    possibleExample: unknown[] = []
  ): unknown {
    if (!example || typeof example !== 'object') {
      return undefined;
    }

    if (matchingSchema.depth > 0 && Array.isArray(example)) {
      return this.traverseArray(example, matchingSchema, possibleExample);
    }

    return this.traverseObject(example, matchingSchema, possibleExample);
  }

  private traverseArray(
    example: unknown,
    matchingSchema: { depth: number; keys: string[] },
    possibleExample: unknown[]
  ): unknown {
    if (matchingSchema.depth > 0 && Array.isArray(example)) {
      possibleExample.push(example);

      return this.traverseArray(
        [...example, undefined].shift(),
        {
          ...matchingSchema,
          depth: matchingSchema.depth - 1
        },
        possibleExample
      );
    }

    return !!example && Array.isArray(example)
      ? undefined
      : this.traverseObject(example, matchingSchema, possibleExample);
  }

  // eslint-disable-next-line complexity
  private traverseObject(
    example: unknown,
    matchingSchema: { depth: number; keys: string[] },
    possibleExample: unknown[]
  ): unknown {
    const objectKeys = Object.keys(example ?? {});

    if (objectKeys.every((key) => matchingSchema.keys.includes(key))) {
      return possibleExample.length > 0 ? possibleExample.shift() : example;
    }

    for (const key of objectKeys) {
      const value = this.traverse(example[key], matchingSchema);
      if (value) {
        return value;
      }
    }
  }
}
