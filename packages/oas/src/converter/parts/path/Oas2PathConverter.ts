import { Sampler } from '../Sampler';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { PathConverter } from './PathConverter';
import { OpenAPIV2 } from '@har-sdk/core';

export class Oas2PathConverter extends PathConverter<OpenAPIV2.Parameter> {
  private readonly oas2ValueSerializer = new Oas2ValueSerializer();

  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected parsePath(
    path: string,
    pathParams: OpenAPIV2.Parameter[],
    values: any[]
  ): string {
    return encodeURI(
      pathParams.reduce(
        (res, param, idx) =>
          res.replace(
            `{${param.name}}`,
            this.oas2ValueSerializer.serialize(param, values[idx])
          ),
        path
      )
    );
  }
}
