import { OperationObject, ParameterObject } from '../../types';
import { filterLocationParams, getParameters } from '../../utils';
import { Sampler } from '../Sampler';
import { SubConverter } from './SubConverter';
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

export class HeadersConverter implements SubConverter<Header[]> {
  constructor(
    private readonly spec: OpenAPI.Document,
    private readonly sampler: Sampler
  ) {}

  public convert(path: string, method: string): Header[] {
    const headers: Header[] = [];
    const pathObj = this.spec.paths[path][method];

    headers.push(...this.createContentTypeHeaders(pathObj));
    headers.push(...this.createAcceptHeaders(pathObj));

    headers.push(...this.parseFromParams(path, method));
    headers.push(...this.parseSecurityRequirements(pathObj));

    return headers;
  }

  private createContentTypeHeaders(pathObj: OperationObject): Header[] {
    const values = [];

    if ('consumes' in pathObj && Array.isArray(pathObj.consumes)) {
      values.push(...pathObj.consumes);
    } else if (
      'requestBody' in pathObj &&
      'content' in pathObj.requestBody &&
      pathObj.requestBody?.content
    ) {
      values.push(...Object.keys(pathObj.requestBody.content));
    }

    return this.createHeaders('content-type', values);
  }

  private createAcceptHeaders(pathObj: OperationObject): Header[] {
    return this.createHeaders(
      'accept',
      'produces' in pathObj && Array.isArray(pathObj.produces)
        ? pathObj.produces
        : []
    );
  }

  private parseFromParams(path: string, method: string): Header[] {
    const params: ParameterObject[] = getParameters(this.spec, path, method);
    const tokens = ['paths', path, method];

    return filterLocationParams(params, 'header').map((param) => ({
      name: param.name.toLowerCase(),
      value: this.serializeHeaderValue(
        this.sampler.sampleParam(param, {
          spec: this.spec,
          tokens,
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

  private getSecuritySchemes():
    | Record<string, SecuritySchemeObject>
    | undefined {
    if ('securityDefinitions' in this.spec) {
      return this.spec.securityDefinitions;
    } else if ('components' in this.spec) {
      return this.spec.components.securitySchemes as Record<
        string,
        SecuritySchemeObject
      >;
    }
  }

  private parseSecurityRequirements(pathObj: OperationObject): Header[] {
    const secRequirementObjects = this.getSecurityRequirementObjects(pathObj);
    if (!secRequirementObjects) {
      return [];
    }

    const securitySchemes = this.getSecuritySchemes();
    if (!securitySchemes) {
      return [];
    }

    for (const obj of secRequirementObjects) {
      const header = this.parseSecurityScheme(
        securitySchemes[Object.keys(obj)[0]]
      );
      if (header) {
        return [header];
      }
    }

    return [];
  }

  private parseSecurityScheme(
    securityScheme: SecuritySchemeObject
  ): Header | undefined {
    return (
      this.parseOas2SecurityScheme(securityScheme) ||
      this.parseOas3SecurityScheme(securityScheme)
    );
  }

  private parseOas2SecurityScheme(
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

  private parseOas3SecurityScheme(
    securityScheme: SecuritySchemeObject
  ): Header | undefined {
    const httpScheme =
      'scheme' in securityScheme
        ? securityScheme.scheme.toLowerCase()
        : undefined;

    switch (httpScheme) {
      case 'basic':
        return this.createBasicAuthHeader();
      case 'bearer':
        return this.createBearerAuthHeader();
    }

    return this.parseApiKeyScheme(securityScheme);
  }

  private parseApiKeyScheme(
    securityScheme: SecuritySchemeObject
  ): Header | undefined {
    if ('in' in securityScheme && securityScheme.in === 'header') {
      return this.createApiKeyHeader(securityScheme);
    }
  }

  private createBearerAuthHeader(): Header {
    return this.createHeader('authorization', 'Bearer REPLACE_BEARER_TOKEN');
  }

  private createBasicAuthHeader(): Header {
    return this.createHeader('authorization', 'Basic REPLACE_BASIC_AUTH');
  }

  private createApiKeyHeader(scheme: SecuritySchemeApiKey): Header {
    return this.createHeader(scheme.name.toLowerCase(), 'REPLACE_KEY_VALUE');
  }

  private createHeader(name: string, value: string): Header {
    return {
      name,
      value
    };
  }

  private createHeaders(name: string, values: string[]): Header[] {
    return values.map((value) => this.createHeader(name, value));
  }
}
