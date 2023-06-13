import { LocationParam } from '../LocationParam';
import { Sampler } from '../../Sampler';
import { UriTemplator } from '../UriTemplator';
import { CookiesConverter } from './CookiesConverter';
import { Cookie, OpenAPIV3 } from '@har-sdk/core';

export class Oas3CookiesConverter extends CookiesConverter<OpenAPIV3.Document> {
  private readonly uriTemplator = new UriTemplator();

  constructor(spec: OpenAPIV3.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected convertCookieParam({
    param,
    value
  }: LocationParam<OpenAPIV3.ParameterObject>): Cookie {
    // For details please refer to the following issues:
    // - https://github.com/OAI/OpenAPI-Specification/pull/3193
    // - https://github.com/OAI/OpenAPI-Specification/issues/1528
    return this.createCookie(
      param.name,
      decodeURIComponent(
        this.uriTemplator.substitute(`{x}`, {
          x: value
        })
      )
    );
  }
}
