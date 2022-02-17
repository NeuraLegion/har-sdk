import { ParameterObject } from '../../types';
import { isOASV2, getParameters, filterLocationParams } from '../../utils';
import { Sampler } from '../Sampler';
import { Oas2ValueSerializer } from '../Oas2ValueSerializer';
import { UriTemplator } from '../UriTemplator';
import { SubConverter } from './SubConverter';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

export class PathConverter implements SubConverter<string> {
  private uriTemplator = new UriTemplator();
  private oas2ValueSerializer = new Oas2ValueSerializer();

  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  public convert(path: string, method: string): string {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const pathParams = filterLocationParams(params, 'path');

    const tokens = ['paths', path, method];
    const sampledParamValues = pathParams.map((param) =>
      this.sampler.sampleParam(param, {
        tokens,
        spec: this.spec,
        idx: params.indexOf(param)
      })
    );

    return isOASV2(this.spec)
      ? this.parseOas2Path(
          path,
          pathParams as OpenAPIV2.Parameter[],
          sampledParamValues
        )
      : this.parseOas3Path(
          path,
          pathParams as OpenAPIV3.ParameterObject[],
          sampledParamValues
        );
  }

  private parseOas2Path(
    path: string,
    pathParams: OpenAPIV2.Parameter[],
    values: any[]
  ): string {
    return encodeURI(
      pathParams.reduce(
        (res, param, idx) =>
          res.replace(
            `{${param.name}}`,
            this.oas2ValueSerializer.serialize(param, values[idx])
          ),
        path
      )
    );
  }

  private parseOas3Path(
    input: string,
    params: OpenAPIV3.ParameterObject[],
    values: any[]
  ): string {
    const pathTemplateStr = params.reduce(
      (res, param) =>
        res.replace(`{${param.name}}`, this.getOas3PathParamUriTemplate(param)),
      input
    );

    return this.uriTemplator.substitute(
      pathTemplateStr,
      params.reduce(
        (res, param, idx) => ({
          ...res,
          [param.name]: values[idx]
        }),
        {}
      )
    );
  }

  private getOas3PathParamUriTemplate({
    name,
    style,
    explode
  }: ParameterObject): string {
    const suffix = explode ? '*' : '';

    let prefix;
    switch (style) {
      case 'label':
        prefix = '.';
        break;
      case 'matrix':
        prefix = ';';
        break;
      case 'simple':
      default:
        prefix = '';
    }

    return `{${prefix}${name}${suffix}}`;
  }
}
