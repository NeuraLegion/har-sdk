import { Options, Sample, Schema, Specification, Traverse } from './Traverse';
import { mergeDeep, firstArrayElement } from '../utils';
import { Sampler, OpenAPISchema } from '../samplers';
import JsonPointer from 'json-pointer';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

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

  private _samplers: Map<string, Sampler>;

  get samplers(): Map<string, Sampler> {
    return this._samplers;
  }

  set samplers(samplers: Map<string, Sampler>) {
    this._samplers = samplers;
  }

  public clearCache(): void {
    this.refCache = {};
  }

  // eslint-disable-next-line complexity
  public traverse(
    schema: Schema,
    options?: Options,
    spec?: Specification
  ): Sample {
    if (!this.samplers || this.samplers.size === 0) {
      throw Error('Samplers are not set!');
    }

    if (this.isRefExists(schema)) {
      return this.inferRef(spec, schema, options);
    }

    if (this.isExampleExists(schema)) {
      return {
        value: schema.example,
        readOnly: schema.readOnly,
        writeOnly: schema.writeOnly,
        type: schema.type
      };
    }

    if (schema.allOf) {
      return this.allOfSample(
        { ...schema, allOf: undefined } as
          | OpenAPIV3.ReferenceObject
          | OpenAPIV2.ReferenceObject
          | OpenAPIV3.SchemaObject
          | OpenAPIV2.SchemaObject,
        schema.allOf as (
          | OpenAPIV3.ReferenceObject
          | OpenAPIV2.ReferenceObject
          | OpenAPIV3.SchemaObject
          | OpenAPIV2.SchemaObject
        )[],
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

      return this.traverse(firstArrayElement(schema.oneOf), options, spec);
    }

    if (schema.anyOf && schema.anyOf.length) {
      return this.traverse(firstArrayElement(schema.anyOf), options, spec);
    }

    let example: any;
    let type: string;

    if (this.isDefaultExists(schema)) {
      example = schema.default;
    } else if ((schema as any).const !== undefined) {
      example = (schema as any).const;
    } else if (schema.enum && schema.enum.length) {
      example = firstArrayElement(schema.enum);
    } else if ((schema as any).examples && (schema as any).examples.length) {
      example = firstArrayElement((schema as any).examples);
    } else {
      type = schema.type as string;

      if (!type) {
        type = this.inferType(
          schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject
        );
      }

      const sampler = this.samplers.get(type || 'null');

      if (sampler) {
        example = sampler.sample(schema as OpenAPISchema, spec, options);
      }
    }

    return {
      type,
      value: example,
      readOnly: (schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject)
        .readOnly,
      writeOnly: (schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject)
        .writeOnly
    };
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
      const referencedType = this.inferType(referenced);

      result = {
        value:
          referencedType === 'object'
            ? {}
            : referencedType === 'array'
            ? []
            : undefined
      };
    }

    return result;
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

  private isDefaultExists(
    schema: Schema
  ): schema is OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject {
    return (
      (schema as OpenAPIV3.SchemaObject | OpenAPIV2.SchemaObject).default !==
      undefined
    );
  }
}
