import { SecurityRequirementsParser } from './SecurityRequirementsParser';
import type { Sampler } from '../Sampler';
import type { OpenAPIV2 } from '@har-sdk/core';

export class Oas2SecurityRequirementsParser extends SecurityRequirementsParser<OpenAPIV2.Document> {
  constructor(spec: OpenAPIV2.Document, sampler: Sampler) {
    super(spec, sampler);
  }

  protected getSecuritySchemes():
    | Record<string, OpenAPIV2.SecuritySchemeObject>
    | undefined {
    return this.spec.securityDefinitions;
  }
}
