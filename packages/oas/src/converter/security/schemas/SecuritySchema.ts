import type { Sampler } from '../../Sampler';
import type { SecuritySchemeObject } from '../../../types';
import type { Cookie, Header, QueryString, Request } from '@har-sdk/core';

export type InjectionLocation = keyof Pick<
  Request,
  'headers' | 'queryString' | 'cookies'
>;

export abstract class SecurityScheme<T extends SecuritySchemeObject, R> {
  protected constructor(
    protected readonly schema: T,
    private readonly sampler: Sampler
  ) {}

  public abstract createCredentials(): R;

  public abstract authorizeRequest(
    request: Pick<Request, InjectionLocation>
  ): void;

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

  private createKeyValuePairWithSampledValue(name: string): {
    name: string;
    value: string;
  } {
    return this.createKeyValuePair(name, this.sampleCredentials());
  }

  private createKeyValuePair(
    name: string,
    value: string
  ): { name: string; value: string } {
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
