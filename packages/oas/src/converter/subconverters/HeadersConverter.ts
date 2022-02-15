import { isOASV2, isOASV3 } from '../../utils';
import { Sampler } from '../Sampler';
import { SubConverter } from './SubConverter';
import { Header, OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

type OperationObject = OpenAPIV2.OperationObject | OpenAPIV3.OperationObject;

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

    if (Array.isArray(pathObj.consumes)) {
      for (const value of pathObj.consumes) {
        headers.push(this.createHeader('content-type', value));
      }
    } else if (pathObj.requestBody?.content) {
      for (const value of Object.keys(pathObj.requestBody.content)) {
        headers.push(this.createHeader('content-type', value));
      }
    }

    if (Array.isArray(pathObj.produces)) {
      for (const value of pathObj.produces) {
        headers.push(this.createHeader('accept', value));
      }
    }

    headers.push(
      ...this.createFromPathParams(pathObj, ['paths', path, method])
    );
    headers.push(...this.createFromSecurityRequirements(pathObj));

    return headers;
  }

  private createFromPathParams(
    pathObj: OpenAPIV2.OperationObject | OpenAPIV3.OperationObject,
    tokens: string[]
  ): Header[] {
    const params: (OpenAPIV3.ParameterObject | OpenAPIV2.Parameter)[] = (
      Array.isArray(pathObj.parameters) ? pathObj.parameters : []
    ) as (OpenAPIV3.ParameterObject | OpenAPIV2.Parameter)[];

    return params
      .filter(
        (param) =>
          typeof param.in === 'string' && param.in.toLowerCase() === 'header'
      )
      .map((param) => ({
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
    if (isOASV2(this.spec) && this.spec.securityDefinitions) {
      return this.spec.securityDefinitions;
    } else if (isOASV3(this.spec) && this.spec.components) {
      return this.spec.components.securitySchemes as Record<
        string,
        SecuritySchemeObject
      >;
    }
  }

  private createFromSecurityRequirements(pathObj: OperationObject): Header[] {
    const secRequirementObjects = this.getSecurityRequirementObjects(pathObj);
    if (!secRequirementObjects) {
      return [];
    }

    const securitySchemes = this.getSecuritySchemes();
    if (!securitySchemes) {
      return [];
    }

    for (const obj of secRequirementObjects) {
      const header = this.createFromSecurityRequirement(obj, securitySchemes);
      if (header) {
        return [header];
      }
    }
  }

  private createFromSecurityRequirement(
    obj: SecurityRequirementObject,
    securitySchemes: Record<string, SecuritySchemeObject>
  ): Header | undefined {
    const schemeName = Object.keys(obj)[0];
    const securityScheme = securitySchemes[schemeName];
    const authType = securityScheme.type.toLowerCase();
    switch (authType) {
      case 'http':
        switch (
          (securityScheme as OpenAPIV3.HttpSecurityScheme).scheme?.toLowerCase()
        ) {
          case 'bearer':
            return this.createBearerAuthHeader();
          case 'basic':
            return this.createBasicAuthHeader();
        }
        break;
      case 'basic':
        return this.createBasicAuthHeader();
      case 'apikey':
        if ((securityScheme as SecuritySchemeApiKey).in === 'header') {
          return this.createApiKeyHeader(
            securityScheme as SecuritySchemeApiKey
          );
        }
        break;
      case 'oauth2':
        return this.createBearerAuthHeader();
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
}
