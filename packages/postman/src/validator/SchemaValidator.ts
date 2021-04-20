import { Validator } from './Validator';
import { Postman } from '../types/postman';
import Ajv, { ValidateFunction } from 'ajv';
import { ok } from 'assert';
import { join, parse } from 'path';

export class SchemaValidator implements Validator {
  private readonly ALLOWED_SCHEMAS: ReadonlyArray<string> = [
    'https://schema.getpostman.com/json/draft-07/collection/v2.0.0/',
    'https://schema.getpostman.com/json/draft-07/collection/v2.1.0/',
    'https://schema.getpostman.com/json/collection/v2.0.0/',
    'https://schema.getpostman.com/json/collection/v2.1.0/'
  ];
  private readonly META_SCHEMAS: ReadonlyArray<string> = [
    'ajv/lib/refs/json-schema-draft-04.json',
    'ajv/lib/refs/json-schema-draft-07.json'
  ];
  private readonly PATH_TO_SCHEMAS: ReadonlyArray<string> = [
    'schemas/draft-07/v2.0.0/collection.json',
    'schemas/draft-07/v2.1.0/collection.json',
    'schemas/draft-04/v2.0.0/collection.json',
    'schemas/draft-04/v2.1.0/collection.json'
  ];
  private readonly ajv: Ajv.Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      async: true,
      meta: false,
      schemaId: 'auto'
    });
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ajvFormats = require('ajv/lib/compile/formats.js');
    this.ajv.addFormat('uriref', ajvFormats.full['uri-reference']);
    this.META_SCHEMAS.forEach((x: string) =>
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.ajv.addMetaSchema(require(x))
    );
    (this.ajv as any)._refs['http://json-schema.org/schema'] =
      'http://json-schema.org/draft-04/schema'; // optional, using unversioned URI is out of spec
    this.PATH_TO_SCHEMAS.forEach((x: string) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const schema = require(join('../../', x));
      this.ajv.addSchema(schema);
    });
  }

  public async verify(collection: Postman.Collection): Promise<void> {
    ok(collection, 'Postman collection is not provided.');
    ok(collection.info, '"info" section is missed in the collection.');

    const schemaId: string = collection.info.schema
      ? parse(collection.info.schema).dir + '/'
      : '';

    if (!this.ALLOWED_SCHEMAS.includes(schemaId.trim())) {
      throw new Error(
        'Postman v1 collections are not supported. If you are using an older format, convert it to v2 and try again.'
      );
    }

    const validate: ValidateFunction | undefined = this.ajv.getSchema(schemaId);

    if (!validate) {
      throw new Error(
        'Cannot determine version of schema. Schema ID is missed.'
      );
    }

    if (!(await validate(collection))) {
      throw new Error(
        `The Postman Collection file is corrupted. ${this.ajv.errorsText(
          validate.errors
        )}`
      );
    }
  }
}
