import type { Sampler } from '../../Sampler';
import type { SecuritySchemeObject } from '../../../types';
import type { Cookie, Header, QueryString, Request } from '@har-sdk/core';

export enum InjectionLocation {
  HEADERS = 'headers',
  QUERY_STRING = 'queryString',
  COOKIES = 'cookies'
}

export abstract class SecurityScheme<T extends SecuritySchemeObject, R> {
  protected constructor(
    protected readonly schema: T,
    private readonly sampler: Sampler
  ) {}

  public abstract createCredentials(): R | undefined;

  public abstract authorizeRequest(
    request: Pick<Request, InjectionLocation>
  ): void;

  protected createCookieHeader(cookie: Cookie): Header {
    return this.createKeyValuePair('cookie', `${cookie.name}=${cookie.value}`);
  }

  protected createHeader(
    name: string = 'authorization',
    prefix: string = ''
  ): Header {
    const value = this.sampleCredentials();

    return this.createKeyValuePair(
      name.toLowerCase(),
      `${prefix ? `${prefix} ` : ''}${value}`
    );
  }

  protected createQueryString(name: string): QueryString {
    const value = this.sampleCredentials();

    return this.createKeyValuePair(name, value);
  }

  protected createCookie(name: string): Cookie {
    const value = this.sampleCredentials();

    return this.createKeyValuePair(name, value);
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
