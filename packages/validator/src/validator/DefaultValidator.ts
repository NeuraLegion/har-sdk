import { ValidatorResult, Validator } from './Validator';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Collection, getDocumentInfo, Postman } from '@har-sdk/types';
import semver from 'semver';
import { join, parse } from 'path';

export class DefaultValidator implements Validator {
  private readonly ajv: Ajv;

  private readonly PATH_TO_SCHEMAS: ReadonlyArray<string> = [
    'schemas/postman/v2.0.0.json',
    'schemas/postman/v2.1.0.json',
    'schemas/openapi/v2.0.0.json',
    'schemas/openapi/v3.0.0.json'
  ];

  private readonly MIN_ALLOWED_OPEN_API_VERSION = '2.0.0';
  private readonly VERSION_SCHEMA_MAP = {
    2: 'http://swagger.io/v2/schema.json#',
    3: 'http://openapis.org/v3/schema.json#'
  };

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false
    });

    addFormats(this.ajv);

    this.PATH_TO_SCHEMAS.forEach((x: string) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const schema = require(join('../../', x));
      this.ajv.addSchema(schema);
    });
  }

  public async verify(document: Collection.Document): Promise<ValidatorResult> {
    const info: Collection.Info | undefined = getDocumentInfo(document);

    if (!info) {
      throw new Error('Cannot determine version of schema');
    }

    const schemaId = this.getSchemaId(document, info);
    const validate: ValidateFunction | undefined = this.ajv.getSchema(schemaId);

    if (!validate) {
      throw new Error(
        'Cannot determine version of schema. Schema ID is missed.'
      );
    }

    if (!validate(document)) {
      return { errors: validate.errors };
    } else {
      return { errors: [] };
    }
  }

  private getSchemaId(
    document: Collection.Document,
    info: Collection.Info
  ): string {
    if (info.type === Collection.Type.POSTMAN) {
      const doc = document as Postman.Document;

      return doc.info.schema ? parse(doc.info.schema).dir + '/' : '';
    } else {
      let version = info.version;

      if (
        !semver.valid(version) &&
        this.MIN_ALLOWED_OPEN_API_VERSION.startsWith(version)
      ) {
        version = this.MIN_ALLOWED_OPEN_API_VERSION;
      }

      const major = semver.major(version);

      return this.VERSION_SCHEMA_MAP[major] || '';
    }
  }
}
