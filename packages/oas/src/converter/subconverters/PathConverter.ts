import { ParameterObject } from '../../types';
import { isOASV2, getParameters, filterLocationParams } from '../../utils';
import { Sampler } from '../Sampler';
import { ParamsSerializer } from '../ParamsSerializer';
import { SubConverter } from './SubConverter';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';
import template from 'url-template';

export class PathConverter implements SubConverter<string> {
  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler,
    private readonly paramsSerializer: ParamsSerializer
  ) {}

  public convert(path: string, method: string): string {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const pathParams = filterLocationParams(params, 'path');

    const tokens = ['paths', path, method];
    const sampledParams = pathParams.map((param) =>
      this.sampler.sampleParam(param, {
        tokens,
        spec: this.spec,
        idx: params.indexOf(param)
      })
    );

    return isOASV2(this.spec)
      ? this.serializeOas2Path(
          path,
          pathParams as OpenAPIV2.Parameter[],
          sampledParams
        )
      : this.serializeOas3Path(
          path,
          pathParams as OpenAPIV3.ParameterObject[],
          sampledParams
        );
  }

  private serializeOas2Path(
    path: string,
    pathParams: OpenAPIV2.Parameter[],
    sampledParams: any[]
  ): string {
    return encodeURI(
      pathParams.reduce(
        (res, param, idx) =>
          res.replace(
            `{${param.name}}`,
            this.paramsSerializer.serializeValue(
              param,
              sampledParams[idx],
              false
            )
          ),
        path
      )
    );
  }

  // TODO extract URI template logic
  private serializeOas3Path(
    path: string,
    pathParams: OpenAPIV3.ParameterObject[],
    sampledParams: any[]
  ): string {
    const uriTemplatePath = pathParams.reduce(
      (res, param) =>
        res.replace(`{${param.name}}`, this.getParamUriTemplate(param)),
      path
    );

    return template.parse(uriTemplatePath).expand(
      pathParams.reduce(
        (res: Record<string, any>, param, idx) => ({
          ...res,
          [param.name]: sampledParams[idx]
        }),
        {}
      )
    );
  }

  private getParamUriTemplate({
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
