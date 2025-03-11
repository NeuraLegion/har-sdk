import schemaV3_1 from '../schemas/openapi/v3.1.0.json';
import { Draft2020AjvValidator } from './Draft2020AjvValidator';
import { OpenAPIV3_1 } from '@har-sdk/core';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class OAS3_1Validator extends Draft2020AjvValidator<OpenAPIV3_1.Document> {
  private readonly SCHEMA_KEY_REF =
    'https://spec.openapis.org/oas/3.1/schema/2022-10-07';

  constructor() {
    super([schemaV3_1]);
  }

  protected getSchemaKeyRef(): string {
    return this.SCHEMA_KEY_REF;
  }
}
