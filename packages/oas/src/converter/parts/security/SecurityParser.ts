import { Sampler } from '../Sampler';
import { Header, OpenAPI, OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';

type SecurityRequirementObject =
  | OpenAPIV2.SecurityRequirementObject
  | OpenAPIV3.SecurityRequirementObject;

type SecuritySchemeObject =
  | OpenAPIV2.SecuritySchemeObject
  | OpenAPIV3.SecuritySchemeObject;

export type SecurityClaim = {
  type: 'header';
  value: Header;
};

export abstract class SecurityParser<T extends OpenAPI.Document> {
  protected constructor(
    protected readonly spec: T,
    protected readonly sampler: Sampler
  ) {}

  protected abstract getSecuritySchemes():
    | Record<string, SecuritySchemeObject>
    | undefined;

  public parseHeaderSecurityRequirements(pathObj: OpenAPI.Operation): Header[] {
    return this.parseSecurityRequirements(pathObj).map(({ value }) => value);
  }

  protected parseApiKeyScheme(
    securityScheme: SecuritySchemeObject
  ): SecurityClaim | undefined {
    if ('in' in securityScheme) {
      switch (securityScheme.in) {
        case 'header':
          return this.createHeaderClaim('API-Key', securityScheme.name);
        default:
          throw new Error(
            `The ${securityScheme.in} location of the API key is not supported yet.`
          );
      }
    }
  }

  protected createHeaderClaim(
    type: 'Basic' | 'Bearer' | 'API-Key',
    name = 'authorization'
  ): SecurityClaim {
    const token = this.sampleSecurityClaimValue();
    const prefix = type === 'API-Key' ? '' : `${type} `;

    return this.createClaim(name.toLowerCase(), `${prefix}${token}`, 'header');
  }

  protected parseSecurityScheme(
    securityScheme: SecuritySchemeObject
  ): SecurityClaim | undefined {
    const authType = securityScheme.type.toLowerCase();
    switch (authType) {
      case 'basic':
        return this.createHeaderClaim('Basic');
      case 'oauth2':
        return this.createHeaderClaim('Bearer');
      case 'apikey':
        return this.parseApiKeyScheme(securityScheme);
    }
  }

  private parseSecurityRequirements(
    pathObj: OpenAPI.Operation
  ): SecurityClaim[] {
    const securityRequirements = this.getSecurityRequirementObjects(pathObj);
    if (!securityRequirements) {
      return [];
    }

    const securitySchemes = this.getSecuritySchemes();
    if (!securitySchemes) {
      return [];
    }

    return this.createClaims(securityRequirements, securitySchemes);
  }

  private sampleSecurityClaimValue(): string {
    return this.sampler.sample({
      type: 'string',
      format: 'base64'
    });
  }

  private createClaim(
    name: string,
    value: string,
    type: 'header'
  ): SecurityClaim {
    return {
      type,
      value: {
        name,
        value
      }
    };
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
  ): SecurityClaim[] {
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
  ): SecurityClaim[] {
    const claims: SecurityClaim[] = [];

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
