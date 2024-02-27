import { VendorExampleExtractor } from './VendorExampleExtractor';
import { Options, Schema } from './Traverse';
import { firstArrayElement, hasDefault, hasExample } from '../utils';

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
    if (hasDefault(schema)) {
      value = schema.default;
    } else if ((schema as any).const !== undefined) {
      value = (schema as any).const;
    } else if ((schema as any).enum && (schema as any).enum.length) {
      value = firstArrayElement((schema as any).enum);
    }

    return value;
  }

  private extractFromSchemaExamples(schema: Schema): unknown {
    if (hasExample(schema)) {
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
}
