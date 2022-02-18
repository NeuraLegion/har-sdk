import { ParameterObject } from '../../../types';
import { getParameters, filterLocationParams } from '../../../utils';
import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import jsonPointer from 'json-pointer';
import { OpenAPI } from '@har-sdk/core';

export interface PathParam<T> {
  readonly param: T;
  readonly value: unknown;
  readonly jsonPointer: string;
}

export abstract class PathConverter<T extends ParameterObject>
  implements SubConverter<string>
{
  protected constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  protected abstract parsePath(path: string, params: PathParam<T>[]): string;

  public convert(path: string, method: string): string {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const pathParams = filterLocationParams(params, 'path');

    const tokens = ['paths', path, method];

    return this.parsePath(
      path,
      pathParams.map((param) => {
        const idx = params.indexOf(param);

        return {
          param: param as T,
          jsonPointer: jsonPointer.compile([
            ...tokens,
            'parameters',
            idx.toString(10)
          ]),
          value: this.sampler.sampleParam(param, {
            tokens,
            idx,
            spec: this.spec
          })
        };
      })
    );
  }
}
