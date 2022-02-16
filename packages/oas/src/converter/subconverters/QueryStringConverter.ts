import { isOASV3, isObject, Flattener } from '../../utils';
import { Sampler } from '../Sampler';
import { ParamsSerializer } from '../ParamsSerializer';
import { SubConverter } from './SubConverter';
import { OpenAPI, OpenAPIV2, OpenAPIV3, QueryString } from '@har-sdk/core';

export class QueryStringConverter implements SubConverter<QueryString[]> {
  private readonly flattener = new Flattener();

  private readonly oas3: boolean;

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler,
    private readonly paramsSerializer: ParamsSerializer
  ) {
    this.oas3 = isOASV3(this.spec);
  }

  public convert(path: string, method: string): QueryString[] {
    const pathObj = this.spec.paths[path][method];
    const tokens = ['paths', path, method];
    const params: (OpenAPIV2.Parameter | OpenAPIV3.ParameterObject)[] =
      Array.isArray(pathObj.parameters) ? pathObj.parameters : [];

    return params
      .filter(
        (param) =>
          typeof param.in === 'string' && param.in.toLowerCase() === 'query'
      )
      .flatMap((param) =>
        this.convertQueryParam(
          param.name,
          this.paramsSerializer.serializeValue(
            param,
            this.getParameterValue(param) ??
              this.sampler.sampleParam(param, {
                spec: this.spec,
                tokens,
                idx: params.indexOf(param)
              }),
            this.oas3
          )
        )
      );
  }

  private getParameterValue(
    param: OpenAPIV2.Parameter | OpenAPIV3.ParameterObject
  ): any {
    return this.oas3
      ? (param as OpenAPIV3.ParameterObject).example
      : (param as OpenAPIV2.Parameter).default;
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
