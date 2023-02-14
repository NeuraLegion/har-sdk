import { LocationParam } from '../LocationParam';
import { Sampler } from '../Sampler';
import { UriTemplator } from '../UriTemplator';
import { QueryStringConverter } from './QueryStringConverter';
import { Oas3SecurityParser, SecurityParser } from '../security';
import { OpenAPIV3, QueryString } from '@har-sdk/core';

export class Oas3QueryStringConverter extends QueryStringConverter<OpenAPIV3.Document> {
  private _security?: SecurityParser<OpenAPIV3.Document>;

  protected get security(): SecurityParser<OpenAPIV3.Document> {
    if (!this._security) {
      this._security = new Oas3SecurityParser(this.spec, this.sampler);
    }

    return this._security;
  }

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
