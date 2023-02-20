import { ParameterObject } from '../../../types';
import { filterLocationParams, getParameters } from '../../../utils';
import { LocationParam } from '../LocationParam';
import { Sampler } from '../../Sampler';
import { SubConverter } from '../../SubConverter';
import jsonPointer from 'json-pointer';
import { OpenAPI, QueryString } from '@har-sdk/core';

export abstract class QueryStringConverter<T extends OpenAPI.Document>
  implements SubConverter<QueryString[]>
{
  protected constructor(
    private readonly spec: T,
    private readonly sampler: Sampler
  ) {}

  protected abstract convertQueryParam(
    queryParam: LocationParam<ParameterObject>
  ): QueryString[];

  public convert(path: string, method: string): QueryString[] {
    const tokens = ['paths', path, method];
    const params: ParameterObject[] = getParameters(this.spec, path, method);

    return filterLocationParams(params, 'query').flatMap((param) => {
      const idx = params.indexOf(param);
      const value = this.sampler.sampleParam(param, {
        tokens,
        idx,
        spec: this.spec
      });

      return this.convertQueryParam({
        param,
        value,
        jsonPointer: jsonPointer.compile([
          ...tokens,
          'parameters',
          idx.toString(10)
        ])
      });
    });
  }
}
