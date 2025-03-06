import type { Sampler } from '../../Sampler';
import type { SecuritySchemeObject } from '../../../types';
import type { ConverterOptions } from '../../Converter';
import type { Cookie, Header, QueryString, Request } from '@har-sdk/core';

export type InjectionLocation = keyof Pick<
  Request,
  'headers' | 'queryString' | 'cookies'
>;

export abstract class SecurityScheme<
  T extends SecuritySchemeObject,
  R extends Header | QueryString | Cookie
> {
  abstract get location(): InjectionLocation;

  protected constructor(
    protected readonly schema: T,
    private readonly sampler: Sampler,
    protected readonly options: ConverterOptions
  ) {}

  public abstract createCredentials(): R;

  public authorizeRequest(request: Pick<Request, InjectionLocation>): void {
    const credentials = this.createCredentials();
    const location = request[this.location];

    if (
      this.options.skipSecuritySchemeInference &&
      location &&
      location.some((item) => item.name === credentials.name)
    ) {
      return;
    }

    location?.push(credentials);
  }

  protected createCookieHeader(cookie: Cookie): Header {
    return this.createKeyValuePair('cookie', `${cookie.name}=${cookie.value}`);
  }

  protected createAuthorizationHeader(
    httpAuthSchema: string = 'authorization',
    prefix: string = ''
  ): Header {
    const value = this.sampleCredentials();

    return this.createKeyValuePair(
      httpAuthSchema.toLowerCase(),
      `${prefix}${prefix ? ' ' : ''}${value}`
    );
  }

  protected createQueryString(name: string): QueryString {
    return this.createKeyValuePairWithSampledValue(name);
  }

  protected createCookie(name: string): Cookie {
    return this.createKeyValuePairWithSampledValue(name);
  }

  private createKeyValuePairWithSampledValue(
    name: string
  ): Header | QueryString | Cookie {
    return this.createKeyValuePair(name, this.sampleCredentials());
  }

  private createKeyValuePair(
    name: string,
    value: string
  ): Header | QueryString | Cookie {
    return {
      name,
      value
    };
  }

  private sampleCredentials(): string {
    return this.sampler.sample({
      type: 'string',
      format: 'base64'
    });
  }
}
