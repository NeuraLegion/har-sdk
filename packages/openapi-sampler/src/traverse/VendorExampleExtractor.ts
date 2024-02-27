import { Schema } from './Traverse';
import { VendorExtensions } from './VendorExtensions';

interface ExampleShape {
  arrayDepth: number;
  objectKeys: string[];
}

export class VendorExampleExtractor {
  public extract(schema: Schema) {
    return [
      schema[VendorExtensions.X_EXAMPLE],
      schema[VendorExtensions.X_EXAMPLES]
    ].reduce(
      (acc, example) => (acc ? acc : this.findExampleByShape(example, schema)),
      undefined
    );
  }

  private findExampleByShape(example: unknown, schema: Schema) {
    const exampleShape = this.getExampleShape(schema);
    const isPrimitiveType =
      0 === exampleShape.objectKeys.length && exampleShape.arrayDepth === 0;

    if (isPrimitiveType) {
      return example;
    }

    return this.traverse(example, exampleShape);
  }

  private getExampleShape(schema: Schema, depth: number = 0): ExampleShape {
    if ('items' in schema) {
      return this.getExampleShape(schema.items, 1 + depth);
    }

    return {
      arrayDepth: depth,
      objectKeys:
        'properties' in schema && schema.properties
          ? Object.keys(schema.properties)
          : []
    };
  }

  private traverse(
    example: unknown,
    exampleShape: ExampleShape,
    possibleExample: unknown[] = []
  ): unknown {
    if (!example || typeof example !== 'object') {
      return undefined;
    }

    if (exampleShape.arrayDepth > 0 && Array.isArray(example)) {
      return this.traverseArray(example, exampleShape, possibleExample);
    }

    return Array.isArray(example)
      ? undefined
      : this.traverseObject(example, exampleShape, possibleExample);
  }

  private traverseArray(
    example: unknown,
    exampleShape: ExampleShape,
    possibleExample: unknown[]
  ): unknown {
    if (exampleShape.arrayDepth > 0 && Array.isArray(example)) {
      possibleExample.push(example);

      return this.traverseArray(
        [...example, undefined].shift(),
        {
          ...exampleShape,
          arrayDepth: exampleShape.arrayDepth - 1
        },
        possibleExample
      );
    }

    return !!example && (Array.isArray(example) || exampleShape.arrayDepth > 0)
      ? undefined
      : this.traverseObject(example, exampleShape, possibleExample);
  }

  private traverseObject(
    example: unknown,
    exampleShape: ExampleShape,
    possibleExample: unknown[]
  ): unknown {
    const objectKeys = Object.keys(example ?? {});

    if (
      exampleShape.arrayDepth === 0 &&
      objectKeys.every((key) => exampleShape.objectKeys.includes(key))
    ) {
      return possibleExample.length > 0 ? possibleExample.shift() : example;
    }

    return objectKeys
      .map((key) => this.traverse(example[key], exampleShape))
      .filter((obj) => !!obj)
      .shift();
  }
}
