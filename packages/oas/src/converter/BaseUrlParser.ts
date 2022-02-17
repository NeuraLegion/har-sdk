import { isOASV2, isOASV3 } from '../utils';
import { ConvertError } from '../errors';
import { Sampler } from './Sampler';
import { UriTemplator } from './UriTemplator';
import {
  normalizeUrl,
  removeLeadingSlash,
  removeTrailingSlash,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3
} from '@har-sdk/core';
import pointer from 'json-pointer';

export class BaseUrlParser {
  private readonly uriTemplator = new UriTemplator();

  constructor(private readonly sampler: Sampler) {}

  public parse(spec: OpenAPI.Document): string {
    const urls: string[] = this.parseUrls(spec);
    this.ensureUrlsValidness(spec, urls);

    const preferredUrls: string[] = urls.filter(
      (x) => x.startsWith('https') || x.startsWith('wss')
    );

    return this.sampler.sample({
      type: 'array',
      examples: preferredUrls.length ? preferredUrls : urls
    });
  }

  public normalizeUrl(url: string, context?: { jsonPointer: string }): string {
    try {
      return normalizeUrl(url);
    } catch (e) {
      throw new ConvertError(e.message, context?.jsonPointer);
    }
  }

  private parseUrls(spec: OpenAPI.Document): string[] {
    const urls: string[] = [];

    if (isOASV3(spec) && spec.servers?.length) {
      urls.push(...this.parseServers(spec));
    }

    if (isOASV2(spec) && spec.host) {
      urls.push(...this.parseHost(spec));
    }

    return urls;
  }

  private ensureUrlsValidness(spec: OpenAPI.Document, urls: string[]): void {
    if (!Array.isArray(urls) || !urls.length) {
      throw new ConvertError(
        'Target must be specified',
        isOASV2(spec) ? '/host' : '/servers'
      );
    }
  }

  private parseHost(spec: OpenAPIV2.Document): string[] {
    const basePath = removeLeadingSlash(
      typeof spec.basePath === 'string' ? spec.basePath : ''
    ).trim();
    const host = removeTrailingSlash(
      typeof spec.host === 'string' ? spec.host : ''
    ).trim();

    if (!host) {
      throw new ConvertError('Missing mandatory `host` field', '/host');
    }

    const schemes: string[] = Array.isArray(spec.schemes)
      ? spec.schemes
      : ['https'];

    return schemes.map((x: string, idx: number) =>
      this.normalizeUrl(`${x}://${host}/${basePath}`, {
        jsonPointer: pointer.compile(['schemes', idx.toString()])
      })
    );
  }

  private parseServers(spec: OpenAPIV3.Document): string[] {
    return spec.servers.map((server: OpenAPIV3.ServerObject, idx: number) => {
      const variables = server.variables || {};
      const params = Object.entries(variables).reduce(
        (acc, [param, variable]: [string, OpenAPIV3.ServerVariableObject]) => ({
          ...acc,
          [param]: this.sampler.sample(variable, {
            spec,
            jsonPointer: pointer.compile([
              'servers',
              idx.toString(),
              'variables',
              param
            ])
          })
        }),
        {}
      );

      return this.normalizeUrl(
        this.uriTemplator.substitute(server.url, params),
        { jsonPointer: pointer.compile(['servers', idx.toString()]) }
      );
    });
  }
}
