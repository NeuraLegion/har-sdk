import { BaseValidator } from './BaseValidator';
import schemaV2 from '../schemas/postman/v2.0.0.json';
import schemaV21 from '../schemas/postman/v2.1.0.json';
import { Postman } from '@har-sdk/types';
import { parse } from 'path';

export class PostmanValidator extends BaseValidator<Postman.Document> {
  // private readonly PATH_TO_SCHEMAS: ReadonlyArray<string> = [
  //   'schemas/postman/v2.0.0.json',
  //   'schemas/postman/v2.1.0.json'
  // ];

  constructor() {
    super();
    this.loadSchemas([schemaV2, schemaV21]);
  }

  protected getSchemaId(document: Postman.Document): string {
    return document.info.schema ? parse(document.info.schema).dir + '/' : '';
  }
}
