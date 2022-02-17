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

  protected abstract convertHeaderParam(
    param: ParameterObject,
    paramValue: unknown
  ): Header;

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
      return this.createAuthHeader('API-Key', securityScheme.name);
    }
  }

  protected createAuthHeader(
    type: 'Basic' | 'Bearer' | 'API-Key',
    header = 'authorization'
  ): Header {
    const token = this.sampler.sample({
      type: 'string',
      format: 'base64'
    });

    return this.createHeader(
      header,
      `${type === 'API-Key' ? '' : `${type} `}${token}`
    );
  }

  protected createHeader(name: string, value: string): Header {
    return {
      value,
      name: name.toLowerCase()
    };
  }

  protected createHeaders(name: string, values: string[]): Header[] {
    return (Array.isArray(values) ? values : []).map((value) =>
      this.createHeader(name, value)
    );
  }

  protected parseSecurityScheme(
    securityScheme: SecuritySchemeObject
  ): Header | undefined {
    const authType = securityScheme.type.toLowerCase();
    switch (authType) {
      case 'basic':
        return this.createAuthHeader('Basic');
      case 'oauth2':
        return this.createAuthHeader('Bearer');
      case 'apiKey':
        return this.parseApiKeyScheme(securityScheme);
    }
  }

  private parseFromParams(path: string, method: string): Header[] {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const tokens = ['paths', path, method];

    return filterLocationParams(params, 'header').map((param) => {
      const value = this.sampler.sampleParam(param, {
        spec: this.spec,
        tokens,
        idx: params.indexOf(param)
      });

      return this.convertHeaderParam(
        {
          ...param,
          name: param.name.toLowerCase()
        },
        value
      );
    });
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
