import { Options, Sample, Schema, Specification, Traverse } from './Traverse';
import { VendorExampleExtractor } from './VendorExampleExtractor';
import {
  firstArrayElement,
  getReplacementForCircular,
  mergeDeep
} from '../utils';
import { OpenAPISchema, Sampler } from '../samplers';
import JsonPointer from 'json-pointer';
import { IJsonSchema, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

const schemaKeywordTypes = {
  multipleOf: 'number',
  maximum: 'number',
  exclusiveMaximum: 'number',
  minimum: 'number',
  exclusiveMinimum: 'number',

  maxLength: 'string',
  minLength: 'string',
  pattern: 'string',

  items: 'array',
  maxItems: 'array',
  minItems: 'array',
  uniqueItems: 'array',
  additionalItems: 'array',

  maxProperties: 'object',
  minProperties: 'object',
  required: 'object',
  additionalProperties: 'object',
  properties: 'object',
  patternProperties: 'object',
  dependencies: 'object'
};

export class DefaultTraverse implements Traverse {
  private refCache: Record<string, boolean> = {};
  private schemasStack: Schema[] = [];

  private _samplers: Map<string, Sampler>;

  get samplers(): Map<string, Sampler> {
    return this._samplers;
  }

  set samplers(samplers: Map<string, Sampler>) {
    this._samplers = samplers;
  }

  constructor(
    private readonly vendorExampleExtractor: VendorExampleExtractor = new VendorExampleExtractor()
  ) {}

  public clearCache(): void {
    this.refCache = {};
    this.schemasStack = [];
  }

  // eslint-disable-next-line complexity
  public traverse(
    schema: Schema,
    options?: Options,
    spec?: Specification
  ): Sample {
    if (!this.samplers || this.samplers.size === 0) {
      throw Error('Samplers must be set');
    }

    if (this.checkIfCircleRef(schema, options)) {
      return this.getReplacementForCircular(
        schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
      );
    }

    this.pushSchemaStack(schema);

    if (this.isRefExists(schema)) {
      return this.inferRef(spec, schema, options);
    }

    return (
      this.findSchemaExample(schema, options, spec) ??
      this.tryTraverseSubSchema(schema, options, spec) ??
      this.createSchemaExample(schema, options, spec)
    );
  }

  private createSchemaExample(
    schema: Schema,
    options?: Options,
    spec?: Specification
  ): Sample | undefined {
    let example: Sample | undefined;
    let type: string;

    if (this.isDefaultExists(schema)) {
      example = schema.default;
    } else if ((schema as any).const !== undefined) {
      example = (schema as any).const;
    } else if ((schema as any).enum && (schema as any).enum.length) {
      example = firstArrayElement((schema as any).enum);
    } else {
      type = (schema as any).type as string;

      if (!type) {
        type = this.inferType(schema as OpenAPISchema);
      }

      const sampler = this.samplers.get(type || 'null');

      if (sampler) {
        example = sampler.sample(schema as OpenAPISchema, spec, options);
      }
    }

    this.popSchemaStack();

    const { readOnly, writeOnly } = schema as OpenAPISchema;

    return {
      type,
      readOnly,
      writeOnly,
      value: example
    };
  }
  private tryTraverseSubSchema(
    schema: IJsonSchema,
    options?: Options,
    spec?: Specification
  ): Sample | undefined {
    if (schema.allOf) {
      this.popSchemaStack();

      return this.allOfSample(
        { ...schema, allOf: undefined } as Exclude<Schema, IJsonSchema>,
        schema.allOf as Exclude<Schema, IJsonSchema>[],
        options,
        spec
      );
    }

    if (schema.oneOf && schema.oneOf.length) {
      if (schema.anyOf && !options.quiet) {
        // eslint-disable-next-line no-console
        console.warn(
          'oneOf and anyOf are not supported on the same level. Skipping anyOf'
        );
      }

      this.popSchemaStack();

      return this.traverse(
        firstArrayElement(schema.oneOf as Exclude<Schema, IJsonSchema>),
        options,
        spec
      );
    }

    if (schema.anyOf && schema.anyOf.length) {
      this.popSchemaStack();

      return this.traverse(
        firstArrayElement(schema.anyOf as Exclude<Schema, IJsonSchema>),
        options,
        spec
      );
    }
  }

  private findSchemaExample(
    schema: Schema,
    { includeVendorExamples }: Options,
    _: Specification
  ): Sample | undefined {
    let example;

    if (this.isExampleExists(schema)) {
      example = schema.example;
    } else if (this.isExamplesExists(schema)) {
      example = firstArrayElement((schema as any).examples);
    } else {
      example = includeVendorExamples
        ? this.vendorExampleExtractor.extract(schema)
        : undefined;
    }

    if (example !== undefined) {
      const { type, readOnly, writeOnly } = schema as OpenAPISchema;

      this.popSchemaStack();

      return {
        type,
        readOnly,
        writeOnly,
        value: example
      };
    }
  }

  private pushSchemaStack(schema: Schema) {
    this.schemasStack.push(schema);
  }

  private checkIfCircleRef(schema: Schema, options: Options): boolean {
    return (
      this.schemasStack.includes(schema) &&
      this.schemasStack.length > options.maxSampleDepth
    );
  }

  private inferRef(
    spec: Specification,
    schema: OpenAPIV3.ReferenceObject | OpenAPIV2.ReferenceObject,
    options: Options
  ): Sample {
    if (!spec) {
      throw new Error(
        'Your schema contains $ref. You must provide specification in the third parameter.'
      );
    }

    let ref = decodeURIComponent(schema.$ref);

    if (ref.startsWith('#')) {
      ref = ref.substring(1);
    }

    const referenced = JsonPointer.get(spec, ref);

    let result: Sample;

    if (!this.refCache[ref]) {
      this.refCache[ref] = true;
      result = this.traverse(referenced, options, spec);
      this.refCache[ref] = false;
    } else {
      result = this.getReplacementForCircular(referenced);
    }

    this.popSchemaStack();

    return result;
  }

  private getReplacementForCircular(
    referenced: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): { value: unknown } {
    const referencedType = this.inferType(referenced);

    return getReplacementForCircular(referencedType);
  }

  private popSchemaStack(): void {
    this.schemasStack.pop();
  }

  private inferType(
    schema: OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
  ): string {
    if (schema.type) {
      return schema.type as string;
    }

    const keywords = Object.keys(schemaKeywordTypes);

    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      const type = schemaKeywordTypes[keyword];

      if (schema[keyword]) {
        return type;
      }
    }

    return null;
  }

  // eslint-disable-next-line complexity
  private allOfSample(
    into:
      | OpenAPIV3.ReferenceObject
      | OpenAPIV2.ReferenceObject
      | OpenAPIV3.SchemaObject
      | OpenAPIV2.SchemaObject,
    children: (
      | OpenAPIV3.ReferenceObject
      | OpenAPIV2.ReferenceObject
      | OpenAPIV3.SchemaObject
      | OpenAPIV2.SchemaObject
    )[],
    options: Options,
    spec: Specification
  ): Sample {
    const res = this.traverse(into, options, spec);
    const subSamples = [];

    for (const subSchema of children) {
      const { type, readOnly, writeOnly, value } = this.traverse(
        subSchema,
        options,
        spec
      );

      if (res.type && type && type !== res.type) {
        throw new Error(`allOf: schemas with different types can't be merged`);
      }

      res.type = res.type || type;
      res.readOnly = res.readOnly || readOnly;
      res.writeOnly = res.writeOnly || writeOnly;

      if (value != null) {
        subSamples.push(value);
      }
    }

    switch (res.type) {
      case 'object':
        res.value = mergeDeep(res.value || {}, ...subSamples);
        break;

      case 'array':
        if (!options.quiet) {
          // eslint-disable-next-line no-console
          console.warn(
            'OpenAPI Sampler: found allOf with "array" type. Result may be incorrect'
          );
        }

        // eslint-disable-next-line no-case-declarations
        const arraySchema = mergeDeep(...children);
        res.value = this.traverse(arraySchema, options, spec).value;
        break;

      default:
        // eslint-disable-next-line no-case-declarations
        const lastSample = subSamples[subSamples.length - 1];
        res.value = lastSample != null ? lastSample : res.value;
    }

    return res;
  }

  private isRefExists(
    schema: Schema
  ): schema is OpenAPIV3.ReferenceObject | OpenAPIV2.ReferenceObject {
    return (
      (schema as OpenAPIV3.ReferenceObject | OpenAPIV2.ReferenceObject).$ref !==
      undefined
    );
  }

  private isExampleExists(
    schema: Schema
  ): schema is OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject {
    return (
      (schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject).example !==
      undefined
    );
  }

  private isExamplesExists(schema: Schema): schema is { examples: unknown[] } {
    return (
      (schema as any).examples !== undefined &&
      (schema as any).examples.length > 0
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
