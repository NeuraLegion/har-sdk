import { ParameterObject } from '../../../types';
import { Sampler } from '../Sampler';
import { UriTemplator } from '../UriTemplator';
import { PathConverter, PathParam } from './PathConverter';
import { OpenAPIV3 } from '@har-sdk/core';

export class Oas3PathConverter extends PathConverter<OpenAPIV3.ParameterObject> {
  private readonly uriTemplator = new UriTemplator();

  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected parsePath(
    path: string,
    pathParams: PathParam<OpenAPIV3.ParameterObject>[]
  ): string {
    const pathTemplateStr = pathParams.reduce(
      (res, { param }) =>
        res.replace(`{${param.name}}`, this.getOas3PathParamUriTemplate(param)),
      path
    );

    return this.uriTemplator.substitute(
      pathTemplateStr,
      pathParams.reduce(
        (res, pathParam) => ({
          ...res,
          [pathParam.param.name]: pathParam.value
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
