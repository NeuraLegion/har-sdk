import { ParameterObject } from '../../../types';
import { getParameters, filterLocationParams } from '../../../utils';
import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import { OpenAPI, QueryString } from '@har-sdk/core';

export abstract class QueryStringConverter<T extends ParameterObject>
  implements SubConverter<QueryString[]>
{
  protected constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected abstract convertParam(param: T, paramValue: any): QueryString[];

  public convert(path: string, method: string): QueryString[] {
    const tokens = ['paths', path, method];
    const params: ParameterObject[] = getParameters(this.spec, path, method);

    return filterLocationParams(params, 'query').flatMap((param) => {
      const value = this.sampler.sampleParam(param, {
        tokens,
        spec: this.spec,
        idx: params.indexOf(param)
      });

      return this.convertParam(param as T, value);
    });
  }
}
