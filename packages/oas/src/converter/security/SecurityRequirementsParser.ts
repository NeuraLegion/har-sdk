import type { Sampler } from '../Sampler';
import {
  ApiKeyCookieSecurityScheme,
  ApiKeyHeaderSecurityScheme,
  ApiKeyQuerySecurityScheme,
  BasicSecurityScheme,
  BearerSecurityScheme
} from './schemas';
import type { SecurityScheme } from './schemas';
import type { ConverterOptions } from '../Converter';
import type {
  SecurityRequirementObject,
  SecuritySchemeObject
} from '../../types';
import type {
  Cookie,
  Header,
  OpenAPI,
  OpenAPIV2,
  OpenAPIV3,
  QueryString
} from '@har-sdk/core';

export abstract class SecurityRequirementsParser<T extends OpenAPI.Document> {
  protected constructor(
    protected readonly spec: T,
    protected readonly sampler: Sampler,
    protected readonly options: ConverterOptions
  ) {}

  protected abstract getSecuritySchemes():
    | Record<string, SecuritySchemeObject>
    | undefined;

  public parse(
    pathObj: OpenAPI.Operation
  ): SecurityScheme<SecuritySchemeObject, Header | QueryString | Cookie>[] {
    const securityRequirements = this.getSecurityRequirementObjects(pathObj);
    if (!securityRequirements) {
      return [];
    }

    const securitySchemes = this.getSecuritySchemes();
    if (!securitySchemes) {
      return [];
    }

    return this.parseSecurityRequirements(
      securityRequirements,
      securitySchemes
    );
  }

  protected createApiKeySchema(
    securityScheme:
      | OpenAPIV2.SecuritySchemeApiKey
      | OpenAPIV3.ApiKeySecurityScheme
  ):
    | SecurityScheme<
        OpenAPIV2.SecuritySchemeApiKey | OpenAPIV3.ApiKeySecurityScheme,
        Header | QueryString | Cookie
      >
    | undefined {
    if ('in' in securityScheme) {
      switch (securityScheme.in) {
        case 'header':
          return new ApiKeyHeaderSecurityScheme(
            securityScheme,
            this.sampler,
            this.options
          );
        case 'query':
          return new ApiKeyQuerySecurityScheme(
            securityScheme,
            this.sampler,
            this.options
          );
        case 'cookie':
          return new ApiKeyCookieSecurityScheme(
            securityScheme,
            this.sampler,
            this.options
          );
      }
    }
  }

  protected createSchema(
    securityScheme: SecuritySchemeObject
  ):
    | SecurityScheme<SecuritySchemeObject, QueryString | Header | Cookie>
    | undefined {
    switch (securityScheme.type) {
      case 'basic':
        return new BasicSecurityScheme(
          securityScheme,
          this.sampler,
          this.options
        );
      case 'oauth2':
        return new BearerSecurityScheme(
          securityScheme,
          this.sampler,
          this.options
        );
      case 'apiKey':
        return this.createApiKeySchema(securityScheme);
    }
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

  private parseSecurityRequirements(
    securityRequirements: SecurityRequirementObject[],
    securitySchemes: Record<string, SecuritySchemeObject>
  ): SecurityScheme<SecuritySchemeObject, Header | QueryString | Cookie>[] {
    for (const obj of securityRequirements) {
      const parsers = this.parseSecurityRequirement(obj, securitySchemes);
      if (parsers.length) {
        return parsers;
      }
    }

    return [];
  }

  private parseSecurityRequirement(
    securityRequirement: SecurityRequirementObject,
    securitySchemes: Record<string, SecuritySchemeObject>
  ): SecurityScheme<SecuritySchemeObject, Header | QueryString | Cookie>[] {
    const parsers = [];

    for (const schemeName of Object.keys(securityRequirement)) {
      const parser = securitySchemes[schemeName]
        ? this.createSchema(securitySchemes[schemeName])
        : undefined;

      if (parser) {
        parsers.push(parser);
      }
    }

    return parsers;
  }
}
