import { BaseValidator } from './BaseValidator';
import schemaV2 from '../schemas/openapi/v2.0.0.json';
import schemaV3 from '../schemas/openapi/v3.0.0.json';
import { OpenAPI, OpenAPIV2 } from '@har-sdk/core';
import semver from 'semver';

export class OASValidator extends BaseValidator<OpenAPI.Document> {
  private readonly MIN_ALLOWED_VERSION = '2.0.0';

  private readonly VERSION_SCHEMA_MAP: Readonly<Record<2 | 3, string>> = {
    2: 'http://swagger.io/v2/schema.json#',
    3: 'https://spec.openapis.org/oas/3.0/schema/2021-09-28'
  };

  constructor() {
    super([schemaV2, schemaV3]);
  }

  protected getSchemaId(document: OpenAPI.Document): string {
    let version = (
      'openapi' in document
        ? document.openapi
        : (document as OpenAPIV2.Document).swagger || ''
    ).trim();

    if (
      !semver.valid(version) &&
      this.MIN_ALLOWED_VERSION.startsWith(version)
    ) {
      version = this.MIN_ALLOWED_VERSION;
    }

    const major = semver.valid(version) && semver.major(version);

    return (major && this.VERSION_SCHEMA_MAP[major]) || '';
  }
}
