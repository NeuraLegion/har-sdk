import { Sampler } from '../Sampler';
import {
  Cookie,
  Header,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3,
  QueryString
} from '@har-sdk/core';

type SecurityRequirementObject =
  | OpenAPIV2.SecurityRequirementObject
  | OpenAPIV3.SecurityRequirementObject;

type SecuritySchemeObject =
  | OpenAPIV2.SecuritySchemeObject
  | OpenAPIV3.SecuritySchemeObject;

export abstract class SecurityRequirementsParser<T extends OpenAPI.Document> {
  protected constructor(
    protected readonly spec: T,
    protected readonly sampler: Sampler
  ) {}

  protected abstract getSecuritySchemes():
    | Record<string, SecuritySchemeObject>
    | undefined;

  public parse(pathObj: OpenAPI.Operation, location: 'header'): Header[];
  public parse(pathObj: OpenAPI.Operation, location: 'query'): QueryString[];
  public parse(
    pathObj: OpenAPI.Operation,
    location: 'header' | 'query'
  ): (Header | QueryString | Cookie)[] {
    const securityRequirements = this.getSecurityRequirementObjects(pathObj);
    if (!securityRequirements) {
      return [];
    }

    const securitySchemes = this.selectSecuritySchemas(location);
    if (!securitySchemes) {
      return [];
    }

    return this.createClaims(securityRequirements, securitySchemes);
  }

  protected parseApiKeyScheme(
    securityScheme: SecuritySchemeObject
  ): Header | QueryString | undefined {
    if ('in' in securityScheme) {
      switch (securityScheme.in) {
        case 'header':
          return this.createHeader('API-Key', securityScheme.name);
        case 'query':
          return this.createQueryString(securityScheme.name);
      }
    }
  }

  protected createQueryString(name = 'token'): QueryString {
    const value = this.sampleSecurityCredentials();

    return {
      name,
      value
    };
  }

  protected createHeader(
    type: 'Basic' | 'Bearer' | 'API-Key',
    name = 'authorization'
  ): Header {
    const token = this.sampleSecurityCredentials();
    const prefix = type === 'API-Key' ? '' : `${type} `;

    return {
      name: name.toLowerCase(),
      value: `${prefix}${token}`
    };
  }

  protected parseSecurityScheme(
    securityScheme: SecuritySchemeObject
  ): (Header | QueryString) | undefined {
    const authType = securityScheme.type.toLowerCase();
    switch (authType) {
      case 'basic':
        return this.createHeader('Basic');
      case 'oauth2':
        return this.createHeader('Bearer');
      case 'apikey':
        return this.parseApiKeyScheme(securityScheme);
    }
  }

  private selectSecuritySchemas(
    location: 'header' | 'query' | 'cookie'
  ): Record<string, SecuritySchemeObject> | undefined {
    const securitySchemes = this.getSecuritySchemes();
    if (!securitySchemes) {
      return;
    }

    const selectedSchemes = Object.entries(securitySchemes).filter(
      ([_, value]: [string, SecuritySchemeObject]) =>
        (value.type === 'apiKey' && value.in === location) ||
        (value.type !== 'apiKey' && location === 'header')
    );

    if (!selectedSchemes.length) {
      return;
    }

    return Object.fromEntries(selectedSchemes);
  }

  private sampleSecurityCredentials(): string {
    return this.sampler.sample({
      type: 'string',
      format: 'base64'
    });
  }

  private getSecurityRequirementObjects(
    pathObj: OpenAPI.Operation
  ): SecurityRequirementObject[] | undefined {
    if (Array.isArray(pathObj.security)) {
      return pathObj.security;
    } else if (Array.isArray(this.spec.security)) {
      return this.spec.security;
    }
  }

  private createClaims(
    securityRequirements: SecurityRequirementObject[],
    securitySchemes: Record<string, SecuritySchemeObject>
  ): (Header | QueryString)[] {
    for (const obj of securityRequirements) {
      const claims = this.parseSecurityRequirement(obj, securitySchemes);
      if (claims.length) {
        return claims;
      }
    }

    return [];
  }

  private parseSecurityRequirement(
    securityRequirement: SecurityRequirementObject,
    securitySchemes: Record<string, SecuritySchemeObject>
  ): (Header | QueryString)[] {
    const claims: (Header | QueryString)[] = [];

    for (const schemeName of Object.keys(securityRequirement)) {
      const claim = securitySchemes[schemeName]
        ? this.parseSecurityScheme(securitySchemes[schemeName])
        : undefined;

      if (claim) {
        claims.push(claim);
      }
    }

    return claims;
  }
}
