import { LocationParam } from '../LocationParam';
import { Sampler } from '../Sampler';
import { UriTemplator } from '../UriTemplator';
import { QueryStringConverter } from './QueryStringConverter';
import { OpenAPIV3, QueryString } from '@har-sdk/core';

export class Oas3QueryStringConverter extends QueryStringConverter {
  private readonly uriTemplator = new UriTemplator();

  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected convertQueryParam({
    param,
    value: paramValue
  }: LocationParam<OpenAPIV3.ParameterObject>): QueryString[] {
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
