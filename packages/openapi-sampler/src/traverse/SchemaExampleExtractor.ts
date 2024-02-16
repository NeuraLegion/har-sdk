import { VendorExampleExtractor } from './VendorExampleExtractor';
import { Options, Schema } from './Traverse';
import { firstArrayElement } from '../utils';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export class SchemaExampleExtractor {
  constructor(
    protected readonly vendorExampleExtractor: VendorExampleExtractor = new VendorExampleExtractor()
  ) {}

  public extractFromExamples(schema: Schema, options: Options): unknown {
    let value = this.extractFromSchemaExamples(schema);

    value =
      value === undefined
        ? this.extractFromVendorExamples(schema, options)
        : value;

    return value;
  }
  public extractFromProperties(schema: Schema): unknown {
    let value;
    if (this.isDefaultExists(schema)) {
      value = schema.default;
    } else if ((schema as any).const !== undefined) {
      value = (schema as any).const;
    } else if ((schema as any).enum && (schema as any).enum.length) {
      value = firstArrayElement((schema as any).enum);
    }

    return value;
  }

  private extractFromSchemaExamples(schema: Schema): unknown {
    if (this.isExampleExists(schema)) {
      return schema.example;
    } else if (
      (schema as any).examples !== undefined &&
      (schema as any).examples.length > 0
    ) {
      return firstArrayElement((schema as any).examples);
    }
  }

  private extractFromVendorExamples(
    schema: Schema,
    { includeVendorExamples }: Options
  ): unknown {
    return includeVendorExamples
      ? this.vendorExampleExtractor.extract(schema)
      : undefined;
  }

  private isExampleExists(
    schema: Schema
  ): schema is OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject {
    return (
      (schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject).example !==
      undefined
    );
  }

  private isDefaultExists(
    schema: Schema
  ): schema is OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject {
    return (
      (schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject).default !==
      undefined
    );
  }
}
