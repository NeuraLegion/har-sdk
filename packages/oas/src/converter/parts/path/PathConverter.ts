import { ParameterObject } from '../../../types';
import { getParameters, filterLocationParams } from '../../../utils';
import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import { OpenAPI } from '@har-sdk/core';

export abstract class PathConverter<T extends ParameterObject>
  implements SubConverter<string>
{
  protected constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  protected abstract parsePath(
    path: string,
    pathParams: T[],
    paramValues: any[]
  ): string;

  public convert(path: string, method: string): string {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const pathParams = filterLocationParams(params, 'path');

    const tokens = ['paths', path, method];
    const sampledParamValues = pathParams.map((param) =>
      this.sampler.sampleParam(param, {
        spec: this.spec,
        tokens,
        idx: params.indexOf(param)
      })
    );

    return this.parsePath(path, pathParams as T[], sampledParamValues);
  }
}
