import { Options, Sample, Traverse } from './Traverse';
import { mergeDeep } from '../utils';
import { Sampler } from '../samplers';
import JsonPointer from 'json-pointer';
import faker from 'faker';
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types';

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
    schema:
      | OpenAPIV3.ReferenceObject
      | OpenAPIV2.ReferenceObject
      | OpenAPIV3.SchemaObject
      | OpenAPIV2.SchemaObject,
    options: Options,
    spec: OpenAPIV2.Document | OpenAPIV3.Document
  ): Sample {
    if (!this.samplers || this.samplers.size === 0) {
      throw Error('Samplers are not set!');
    }

    if ((schema as OpenAPIV3.ReferenceObject).$ref) {
      return this.inferRef(spec, schema, options);
    }

    if (schema.example !== undefined) {
      return {
        value: schema.example,
        readOnly: schema.readOnly,
        writeOnly: schema.writeOnly,
        type: schema.type
      };
    }

    if (schema.allOf) {
      return this.allOfSample(
        { ...schema, allOf: undefined },
        schema.allOf,
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

      return this.traverse(
        faker.random.arrayElement(schema.oneOf),
        options,
        spec
      );
    }

    if (schema.anyOf && schema.anyOf.length) {
      return this.traverse(
        faker.random.arrayElement(schema.anyOf),
        options,
        spec
      );
    }

    let example: any;
    let type: string;

    if (schema.default !== undefined) {
      example = schema.default;
    } else if (schema.const !== undefined) {
      example = schema.const;
    } else if (schema.enum && schema.enum.length) {
      example = faker.random.arrayElement(schema.enum);
    } else if (schema.examples && schema.examples.length) {
      example = faker.random.arrayElement(schema.examples);
    } else {
      type = schema.type as string;

      if (!type) {
        type = this.inferType(schema);
      }

      const sampler = this.samplers.get(type);

      if (sampler) {
        example = sampler.sample(schema, spec, options);
      }
    }

    return {
      type,
      value: example,
      readOnly: schema.readOnly,
      writeOnly: schema.writeOnly
    };
  }

  private inferRef(
    spec: OpenAPIV2.Document | OpenAPIV3.Document,
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

    return 'null';
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
    spec: OpenAPIV2.Document | OpenAPIV3.Document
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
}
