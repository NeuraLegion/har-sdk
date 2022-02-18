import { ParameterObject } from '../../../types';
import { getParameters, filterLocationParams } from '../../../utils';
import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import jsonPointer from 'json-pointer';
import { OpenAPI, QueryString } from '@har-sdk/core';

export abstract class QueryStringConverter<T extends ParameterObject>
  implements SubConverter<QueryString[]>
{
  protected constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  protected abstract convertQueryParam(
    param: T,
    paramValue: unknown,
    paramJsonPointer: string
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

      return this.convertQueryParam(
        param as T,
        value,
        jsonPointer.compile([...tokens, 'parameters', idx.toString(10)])
      );
    });
  }
}
