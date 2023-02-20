import { LocationParam } from '../LocationParam';
import { Sampler } from '../../Sampler';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { PathConverter } from './PathConverter';
import { OpenAPIV2 } from '@har-sdk/core';

export class Oas2PathConverter extends PathConverter {
  private readonly oas2ValueSerializer = new Oas2ValueSerializer();

  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected parsePath(
    path: string,
    pathParams: LocationParam<OpenAPIV2.Parameter>[]
  ): string {
    return encodeURI(
      pathParams.reduce(
        (res, pathParam) =>
          res.replace(
            `{${pathParam.param.name}}`,
            this.oas2ValueSerializer.serialize(pathParam) as string
          ),
        path
      )
    );
  }
}
