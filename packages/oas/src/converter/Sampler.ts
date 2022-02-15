import { ConvertError } from '../errors';
import { sample, Schema } from '@har-sdk/openapi-sampler';
import pointer from 'json-pointer';
import { OpenAPI } from '@har-sdk/core';

export class Sampler {
  public sampleParam(
    param: OpenAPI.Parameter,
    context: {
      spec: OpenAPI.Document;
      idx: number;
      tokens: string[];
    }
  ): any {
    return this.sample('schema' in param ? param.schema : param, {
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
      return sample(schema, { skipReadOnly: true, quiet: true }, context?.spec);
    } catch (e) {
      throw new ConvertError(e.message, context?.jsonPointer);
    }
  }
}
