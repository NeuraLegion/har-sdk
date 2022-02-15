import { isOASV3, isObject, Flattener } from '../../utils';
import { Sampler } from '../Sampler';
import { ParamsSerializer } from '../ParamsSerializer';
import { SubConverter } from './SubConverter';
import { OpenAPI, OpenAPIV2, OpenAPIV3, QueryString } from '@har-sdk/core';

export class QueryStringConverter implements SubConverter<QueryString[]> {
  private readonly flattener = new Flattener();

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler,
    private readonly paramsSerializer: ParamsSerializer
  ) {}

  public convert(path: string, method: string): QueryString[] {
    const pathObj = this.spec.paths[path][method];
    const tokens = ['paths', path, method];
    const params: (OpenAPIV2.Parameter | OpenAPIV3.ParameterObject)[] =
      Array.isArray(pathObj.parameters) ? pathObj.parameters : [];
    const oas3 = isOASV3(this.spec);

    return params
      .filter(
        (param) =>
          typeof param.in === 'string' && param.in.toLowerCase() === 'query'
      )
      .flatMap((param) => {
        const value = oas3
          ? this.getOas3ParameterValue(param as OpenAPIV3.ParameterObject)
          : this.getOas2ParameterValue(param as OpenAPIV2.Parameter);

        return this.convertQueryParam(
          param.name,
          this.paramsSerializer.serializeValue(
            param,
            value ??
              this.sampler.sampleParam(param, {
                spec: this.spec,
                tokens,
                idx: params.indexOf(param)
              }),
            oas3
          )
        );
      });
  }

  private getOas2ParameterValue(param: OpenAPIV2.Parameter): any {
    if (param.default !== 'undefined') {
      return param.default;
    }
  }

  private getOas3ParameterValue(param: OpenAPIV3.ParameterObject): any {
    if (param.example !== 'undefined') {
      return param.example;
    }
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
