import { AjvValidator } from './AjvValidator';
import schemaV2 from '../schemas/openapi/v2.0.0.json';
import { OpenAPIV2 } from '@har-sdk/core';

export class SwaggerValidator extends AjvValidator<OpenAPIV2.Document> {
  private readonly SCHEMA_KEY_REF = 'http://swagger.io/v2/schema.json#';

  constructor() {
    super([schemaV2]);
  }

  protected getSchemaKeyRef(): string {
    return this.SCHEMA_KEY_REF;
  }
}
