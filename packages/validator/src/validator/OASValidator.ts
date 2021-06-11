import { BaseValidator } from './BaseValidator';
import { isOASV3, OpenAPI } from '@har-sdk/types';
import semver from 'semver';

export class OASValidator extends BaseValidator<OpenAPI.Document> {
  private readonly MIN_ALLOWED_VERSION = '2.0.0';

  private readonly PATH_TO_SCHEMAS: ReadonlyArray<string> = [
    'schemas/openapi/v2.0.0.json',
    'schemas/openapi/v3.0.0.json'
  ];

  private readonly VERSION_SCHEMA_MAP = {
    2: 'http://swagger.io/v2/schema.json#',
    3: 'http://openapis.org/v3/schema.json#'
  };

  constructor() {
    super();
    this.loadSchemas(this.PATH_TO_SCHEMAS);
  }

  protected getSchemaId(document: OpenAPI.Document): string {
    let version = (
      isOASV3(document) ? document.openapi : document.swagger || ''
    ).trim();

    if (
      !semver.valid(version) &&
      this.MIN_ALLOWED_VERSION.startsWith(version)
    ) {
      version = this.MIN_ALLOWED_VERSION;
    }

    const major = semver.major(version);

    return this.VERSION_SCHEMA_MAP[major] || '';
  }
}
