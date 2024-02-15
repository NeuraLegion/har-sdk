import { ConvertError } from '../errors';
import { isOASV2 } from '../utils';
import {
  Options,
  sample,
  Schema,
  VendorExtensions
} from '@har-sdk/openapi-sampler';
import pointer from 'json-pointer';
import type { OpenAPI } from '@har-sdk/core';

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
    return 'schema' in param
      ? {
          ...param.schema,
          ...(param[VendorExtensions.X_EXAMPLE] !== undefined
            ? {
                [VendorExtensions.X_EXAMPLE]: param[VendorExtensions.X_EXAMPLE]
              }
            : {}),
          ...(param[VendorExtensions.X_EXAMPLES] !== undefined
            ? {
                [VendorExtensions.X_EXAMPLES]:
                  param[VendorExtensions.X_EXAMPLES]
              }
            : {}),
          ...(param.example !== undefined ? { example: param.example } : {})
        }
      : (param as Schema);
  }
}
