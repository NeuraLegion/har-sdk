import { ParameterObject } from '../../../types';
import { Sampler } from '../Sampler';
import { UriTemplator } from '../UriTemplator';
import { PathConverter } from './PathConverter';
import { OpenAPIV3 } from '@har-sdk/core';

export class Oas3PathConverter extends PathConverter<OpenAPIV3.ParameterObject> {
  private uriTemplator = new UriTemplator();

  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected parsePath(
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
