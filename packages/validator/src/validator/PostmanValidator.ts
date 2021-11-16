import { BaseValidator } from './BaseValidator';
import schemaV2 from '../schemas/postman/v2.0.0.json';
import schemaV21 from '../schemas/postman/v2.1.0.json';
import { Postman } from '@har-sdk/types';

export class PostmanValidator extends BaseValidator<Postman.Document> {
  private readonly VERSION_SCHEMA_MAP: Readonly<Record<string, string>> = {
    'v2.0.0': 'https://schema.getpostman.com/json/draft-07/collection/v2.0.0/',
    'v2.1.0': 'https://schema.getpostman.com/json/draft-07/collection/v2.1.0/'
  };

  constructor() {
    super([schemaV2, schemaV21]);
  }

  protected getSchemaId(document: Postman.Document): string {
    const versions = Object.keys(this.VERSION_SCHEMA_MAP);

    const version = document.info.schema
      .split('/')
      .find((str) => versions.includes(str));

    return this.VERSION_SCHEMA_MAP[version] || '';
  }
}
