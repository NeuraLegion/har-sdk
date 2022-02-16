import { Sampler } from '../Sampler';
import { SubConverter } from './SubConverter';
import { Header, OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

type OperationObject = OpenAPIV2.OperationObject | OpenAPIV3.OperationObject;
type ParameterObject = OpenAPIV3.ParameterObject | OpenAPIV2.Parameter;

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

    headers.push(...this.parsePathParams(pathObj, ['paths', path, method]));
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

  private parsePathParams(
    pathObj: OperationObject,
    tokens: string[]
  ): Header[] {
    const params: ParameterObject[] = (
      Array.isArray(pathObj.parameters) ? pathObj.parameters : []
    ) as ParameterObject[];

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
      const header = this.parseSecurityRequirement(obj, securitySchemes);
      if (header) {
        return [header];
      }
    }
  }

  private parseSecurityRequirement(
    obj: SecurityRequirementObject,
    securitySchemes: Record<string, SecuritySchemeObject>
  ): Header | undefined {
    const securityScheme = securitySchemes[Object.keys(obj)[0]];
    const authType = securityScheme.type.toLowerCase();
    const httpScheme =
      'scheme' in securityScheme
        ? securityScheme.scheme.toLowerCase()
        : undefined;

    if (authType === 'basic' || httpScheme === 'basic') {
      return this.createBasicAuthHeader();
    }

    if (authType === 'oauth2' || httpScheme === 'bearer') {
      return this.createBearerAuthHeader();
    }

    if (
      authType === 'apikey' &&
      'in' in securityScheme &&
      securityScheme.in === 'header'
    ) {
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
