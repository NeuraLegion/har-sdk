import { Sampler } from '../Sampler';
import { UriTemplator } from '../UriTemplator';
import { QueryStringConverter } from './QueryStringConverter';
import { OpenAPIV3, QueryString } from '@har-sdk/core';

export class Oas3QueryStringConverter extends QueryStringConverter<OpenAPIV3.ParameterObject> {
  private readonly uriTemplator = new UriTemplator();

  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected convertParam(
    param: OpenAPIV3.ParameterObject,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
