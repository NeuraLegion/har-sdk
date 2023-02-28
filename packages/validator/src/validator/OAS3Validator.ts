import { AjvValidator } from './AjvValidator';
import schemaV3 from '../schemas/openapi/v3.0.0.json';
import { OpenAPIV3 } from '@har-sdk/core';

export class OAS3Validator extends AjvValidator<OpenAPIV3.Document> {
  private readonly SCHEMA_KEY_REF =
    'https://spec.openapis.org/oas/3.0/schema/2021-09-28';

  constructor() {
    super([schemaV3]);
  }

  protected getSchemaKeyRef(): string {
    return this.SCHEMA_KEY_REF;
  }
}
