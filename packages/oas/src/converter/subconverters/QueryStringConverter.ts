import { ParameterObject } from '../../types';
import {
  getParameterValue,
  isOASV3,
  isObject,
  Flattener,
  getParameters,
  filterLocationParams
} from '../../utils';
import { Sampler } from '../Sampler';
import { ParamsSerializer } from '../ParamsSerializer';
import { SubConverter } from './SubConverter';
import { OpenAPI, QueryString } from '@har-sdk/core';

export class QueryStringConverter implements SubConverter<QueryString[]> {
  private readonly flattener = new Flattener();

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler,
    private readonly paramsSerializer: ParamsSerializer
  ) {}

  public convert(path: string, method: string): QueryString[] {
    const tokens = ['paths', path, method];
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const oas3 = isOASV3(this.spec);

    return filterLocationParams(params, 'query').flatMap((param) => {
      const value =
        getParameterValue(param) ??
        this.sampler.sampleParam(param, {
          spec: this.spec,
          tokens,
          idx: params.indexOf(param)
        });

      return this.convertQueryParam(
        param.name,
        this.paramsSerializer.serializeValue(param, value, oas3)
      );
    });
  }

  private convertQueryParam(name: string, value: any): QueryString[] {
    let values: QueryString[];

    if (isObject(value)) {
      const flatten = this.flattener.toFlattenObject(value, {
        format: 'indices'
      });
      values = Object.entries(flatten).map(([n, x]: any[]) => ({
        name: n,
        value: `${x}`
      }));
    } else if (Array.isArray(value)) {
      values = value.map((x) => ({ name, value: `${x}` }));
    } else {
      values = [
        {
          name,
          value: `${value}`
        }
      ];
    }

    return values;
  }
}
