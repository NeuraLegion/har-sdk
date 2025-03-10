import { LocationParam } from '../LocationParam';
import { Sampler } from '../../Sampler';
import { CookiesConverter } from './CookiesConverter';
import { Cookie, OpenAPIV2 } from '@har-sdk/core';

export class Oas2CookiesConverter extends CookiesConverter<OpenAPIV2.Document> {
  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected convertCookieParam(
    _: LocationParam<OpenAPIV2.ParameterObject>
  ): Cookie {
    throw new TypeError(`Cookie parameters are not supported for OpenAPI 2.0`);
  }
}
