import { ParameterObject } from '../../types';
import {
  isOASV3,
  isObject,
  Flattener,
  getParameters,
  filterLocationParams
} from '../../utils';
import { Sampler } from '../Sampler';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { UriTemplator } from '../UriTemplator';
import { SubConverter } from './SubConverter';
import { OpenAPI, OpenAPIV2, OpenAPIV3, QueryString } from '@har-sdk/core';

export class QueryStringConverter implements SubConverter<QueryString[]> {
  private readonly flattener = new Flattener();
  private readonly uriTemplator = new UriTemplator();
  private readonly oas2ValueSerializer = new Oas2ValueSerializer();

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  public convert(path: string, method: string): QueryString[] {
    const tokens = ['paths', path, method];
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const oas3 = isOASV3(this.spec);

    return filterLocationParams(params, 'query').flatMap((param) => {
      const value = this.sampler.sampleParam(param, {
        tokens,
        spec: this.spec,
        idx: params.indexOf(param)
      });

      return oas3
        ? this.convertOas3QueryParam(param as OpenAPIV3.ParameterObject, value)
        : this.convertOas2QueryParam(
            param.name,
            this.oas2ValueSerializer.serialize(
              param as OpenAPIV2.Parameter,
              value
            )
          );
    });
  }

  private convertOas2QueryParam(name: string, value: any): QueryString[] {
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

  private convertOas3QueryParam(
    param: OpenAPIV3.ParameterObject,
    paramValue: any
  ): QueryString[] {
    const templateStr = this.getQueryParamUriTemplate(param);

    let queryString = this.uriTemplator.substitute(templateStr, {
      [param.name]: paramValue == null ? '' : paramValue
    });

    if (
      !param.explode &&
      ['spaceDelimited', 'pipeDelimited'].includes(param.style)
    ) {
      queryString = queryString.replace(/,/g, this.getCustomDelimiter(param));
    }

    return queryString
      .substring(1)
      .split('&')
      .map((item) => item.split('='))
      .map(([name, value]: string[]) => ({
        name: decodeURIComponent(name),
        value: decodeURIComponent(value)
      }));
  }

  private getQueryParamUriTemplate({
    name,
    explode
  }: OpenAPIV3.ParameterObject): string {
    const suffix = explode ? '*' : '';

    return `{?${name}${suffix}}`;
  }

  private getCustomDelimiter({
    style
  }: OpenAPIV3.ParameterObject): string | undefined {
    return style === 'pipeDelimited'
      ? '|'
      : style === 'spaceDelimited'
      ? ' '
      : undefined;
  }
}
