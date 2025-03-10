import { ParameterObject } from '../../../types';
import { filterLocationParams, getParameters } from '../../../utils';
import { LocationParam } from '../LocationParam';
import { Sampler } from '../../Sampler';
import { SubConverter } from '../../SubConverter';
import { Cookie, Header, OpenAPI } from '@har-sdk/core';
import jsonPointer from 'json-pointer';

export abstract class CookiesConverter<T extends OpenAPI.Document>
  implements SubConverter<Cookie[]>
{
  protected constructor(
    private readonly spec: T,
    private readonly sampler: Sampler
  ) {}

  protected abstract convertCookieParam(
    cookieParam: LocationParam<ParameterObject>
  ): Cookie;

  public convert(path: string, method: string): Cookie[] {
    const cookies: Cookie[] = [];

    cookies.push(...this.parseFromParams(path, method));

    return cookies;
  }

  protected createCookie(name: string, value: string): Cookie {
    return {
      value,
      name
    };
  }

  protected createCookies(name: string, values: string[]): Header[] {
    return (Array.isArray(values) ? values : []).map((value) =>
      this.createCookie(name, value)
    );
  }

  private parseFromParams(path: string, method: string): Header[] {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const tokens = ['paths', path, method];

    return filterLocationParams(params, 'cookie').map((param) => {
      const idx = params.indexOf(param);
      const spec = this.spec;

      const value = this.sampler.sampleParam(param, {
        tokens,
        idx,
        spec
      });

      return this.convertCookieParam({
        value,
        param,
        jsonPointer: jsonPointer.compile([
          ...tokens,
          'parameters',
          idx.toString(10)
        ])
      });
    });
  }
}
