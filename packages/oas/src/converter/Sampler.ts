import { ConvertError } from '../errors';
import { isOASV2 } from '../utils';
import {
  Options,
  sample,
  Schema,
  VendorExtensions
} from '@har-sdk/openapi-sampler';
import pointer from 'json-pointer';
import { OpenAPI, OpenAPIV3 } from '@har-sdk/core';

export class Sampler {
  constructor(private readonly options: Options) {}

  public sampleParam(
    param: OpenAPI.Parameter,
    context: {
      spec: OpenAPI.Document;
      idx: number;
      tokens: string[];
    }
  ): any {
    return this.sample(this.createParamSchema(param), {
      spec: context.spec,
      jsonPointer: pointer.compile([
        ...context.tokens,
        'parameters',
        context.idx.toString(),
        ...('schema' in param ? ['schema'] : [])
      ])
    });
  }

  /**
   * To exclude extra fields that are used in response only, {@link Options.skipReadOnly} must be used.
   * @see {@link https://swagger.io/docs/specification/data-models/data-types/#readonly-writeonly | Read-Only and Write-Only Properties}
   */
  public sample(
    schema: Schema,
    context?: {
      spec?: OpenAPI.Document;
      jsonPointer?: string;
    }
  ): any | undefined {
    try {
      const { includeVendorExamples } = this.options;
      const options = {
        ...this.options,
        skipReadOnly: true,
        quiet: true,
        includeVendorExamples:
          context?.spec && isOASV2(context?.spec)
            ? includeVendorExamples
            : false
      };

      return sample(schema, options, context?.spec);
    } catch (e) {
      throw new ConvertError(e.message, context?.jsonPointer);
    }
  }

  private createParamSchema(param: OpenAPI.Parameter): Schema {
    if ('schema' in param) {
      const { schema, ...rest } = param;

      const examples = (param.examples ?? {}) as Record<
        string,
        OpenAPIV3.ExampleObject
      >;

      const exampleKey = this.sample({
        type: 'array',
        examples: Object.keys(examples)
      });

      const example =
        examples[exampleKey]?.value ?? param.example ?? schema.example;

      return {
        ...schema,
        ...(example !== undefined ? { example } : {}),
        ...this.extractVendorExamples(rest)
      };
    }

    return param as Schema;
  }

  private extractVendorExamples(param: OpenAPI.Parameter) {
    return [VendorExtensions.X_EXAMPLE, VendorExtensions.X_EXAMPLES].reduce(
      (acc, prop) => ({
        ...acc,
        ...(param[prop] !== undefined ? { [prop]: param[prop] } : {})
      }),
      {}
    );
  }
}
