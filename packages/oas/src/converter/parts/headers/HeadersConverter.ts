import { OperationObject, ParameterObject } from '../../../types';
import { filterLocationParams, getParameters } from '../../../utils';
import { Sampler } from '../Sampler';
import { SubConverter } from '../../SubConverter';
import { Header, OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

type SecurityRequirementObject =
  | OpenAPIV2.SecurityRequirementObject
  | OpenAPIV3.SecurityRequirementObject;

type SecuritySchemeObject =
  | OpenAPIV2.SecuritySchemeObject
  | OpenAPIV3.SecuritySchemeObject;

type SecuritySchemeApiKey =
  | OpenAPIV2.SecuritySchemeApiKey
  | OpenAPIV3.ApiKeySecurityScheme;

export abstract class HeadersConverter<T extends OpenAPI.Document>
  implements SubConverter<Header[]>
{
  protected constructor(
    protected readonly spec: T,
    private readonly sampler: Sampler
  ) {}

  protected abstract createContentTypeHeaders(
    pathObj: OperationObject
  ): Header[];
  protected abstract createAcceptHeaders(pathObj: OperationObject): Header[];
  protected abstract getSecuritySchemes():
    | Record<string, SecuritySchemeObject>
    | undefined;

  public convert(path: string, method: string): Header[] {
    const headers: Header[] = [];
    const pathObj = this.spec.paths[path][method];

    headers.push(...this.createContentTypeHeaders(pathObj));
    headers.push(...this.createAcceptHeaders(pathObj));

    headers.push(...this.parseFromParams(path, method));
    headers.push(...this.parseSecurityRequirements(pathObj));

    return headers;
  }

  protected parseApiKeyScheme(
    securityScheme: SecuritySchemeObject
  ): Header | undefined {
    if ('in' in securityScheme && securityScheme.in === 'header') {
      return this.createApiKeyHeader(securityScheme);
    }
  }

  protected createBearerAuthHeader(): Header {
    return this.createHeader('authorization', 'Bearer REPLACE_BEARER_TOKEN');
  }

  protected createBasicAuthHeader(): Header {
    return this.createHeader('authorization', 'Basic REPLACE_BASIC_AUTH');
  }

  protected createApiKeyHeader(scheme: SecuritySchemeApiKey): Header {
    return this.createHeader(scheme.name.toLowerCase(), 'REPLACE_KEY_VALUE');
  }

  protected createHeader(name: string, value: string): Header {
    return {
      name,
      value
    };
  }

  protected createHeaders(name: string, values: string[]): Header[] {
    return values.map((value) => this.createHeader(name, value));
  }

  protected parseSecurityScheme(
    securityScheme: SecuritySchemeObject
  ): Header | undefined {
    const authType = securityScheme.type.toLowerCase();
    switch (authType) {
      case 'basic':
        return this.createBasicAuthHeader();
      case 'oauth2':
        return this.createBearerAuthHeader();
      case 'apiKey':
        return this.parseApiKeyScheme(securityScheme);
    }
  }

  private parseFromParams(path: string, method: string): Header[] {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const tokens = ['paths', path, method];

    return filterLocationParams(params, 'header').map((param) => ({
      name: param.name.toLowerCase(),
      value: this.serializeHeaderValue(
        this.sampler.sampleParam(param, {
          tokens,
          spec: this.spec,
          idx: params.indexOf(param)
        })
      )
    }));
  }

  private serializeHeaderValue(value: any): string {
    // TODO proper serialization
    return typeof value === 'object' ? JSON.stringify(value) : value;
  }

  private getSecurityRequirementObjects(
    pathObj: OperationObject
  ): SecurityRequirementObject[] | undefined {
    if (Array.isArray(pathObj.security)) {
      return pathObj.security;
    } else if (Array.isArray(this.spec.security)) {
      return this.spec.security;
    }
  }

  private parseSecurityRequirements(pathObj: OperationObject): Header[] {
    const securityRequirements = this.getSecurityRequirementObjects(pathObj);
    if (!securityRequirements) {
      return [];
    }

    const securitySchemes = this.getSecuritySchemes();
    if (!securitySchemes) {
      return [];
    }

    for (const obj of securityRequirements) {
      const schemeName = this.sampler.sample({
        type: 'array',
        examples: Object.keys(obj)
      });
      const header = this.parseSecurityScheme(securitySchemes[schemeName]);

      if (header) {
        return [header];
      }
    }

    return [];
  }
}
