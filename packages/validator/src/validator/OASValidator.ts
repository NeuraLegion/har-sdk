import { Validator } from './Validator';
import { OAS } from '../collection';
import Ajv, { ValidateFunction } from 'ajv';
import { openapi } from 'openapi-schemas';
import semver from 'semver';
import { IJsonSchema, OpenAPIV3 } from 'openapi-types';
import { ok } from 'assert';

export class OASValidator implements Validator {
  private readonly MIN_ALLOWED_VERSION = '2.0.0';

  private readonly META_SCHEMAS: ReadonlyArray<string> = [
    'ajv/lib/refs/json-schema-draft-04.json'
  ];
  private readonly VERSION_SCHEMA_MAP = {
    2: openapi.v2.id,
    3: openapi.v3.id
  };
  private readonly PATH_TO_SCHEMAS: ReadonlyArray<IJsonSchema> = [
    openapi.v2,
    openapi.v3
  ];

  private readonly ajv: Ajv.Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      $data: true,
      jsonPointers: true,
      extendRefs: true,
      async: true,
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
    this.PATH_TO_SCHEMAS.forEach((schema: IJsonSchema) => {
      this.ajv.addSchema(schema);
    });
  }

  public async verify(spec: OAS.Document): Promise<void> {
    ok(spec, 'The specification is not provided.');
    this.validateVersion(spec);
    await this.validateSpec(spec);
  }

  private async validateSpec(spec: OAS.Document): Promise<void> {
    const version = this.getVersion(spec);

    const schemaNotFound =
      'Cannot determine version of schema. Schema ID is missed.';

    const major = semver.major(version);
    const schemaId = this.VERSION_SCHEMA_MAP[major];

    ok(schemaId, schemaNotFound);

    const validate: ValidateFunction | undefined = this.ajv.getSchema(schemaId);

    ok(validate, schemaNotFound);

    if (!(await validate(spec))) {
      throw new Error(
        `The specification file is corrupted. ${this.ajv.errorsText(
          validate.errors
        )}`
      );
    }
  }

  private validateVersion(spec: OAS.Document): void {
    const version = this.getVersion(spec);

    if (!semver.gte(version, this.MIN_ALLOWED_VERSION)) {
      throw new Error(
        'Swagger v1 are not supported. If you are using an older format, convert it to v2 and try again.'
      );
    }
  }

  private getVersion(spec: OAS.Document): string {
    // let version = (Versioning.isV3(spec) spec.openapi || spec.swagger || '').trim();
    let version = (this.isV3(spec) ? spec.openapi : spec.swagger || '').trim();

    ok(version, 'Cannot determine version of specification.');

    if (
      !semver.valid(version) &&
      this.MIN_ALLOWED_VERSION.startsWith(version)
    ) {
      version = this.MIN_ALLOWED_VERSION;
    }

    return version;
  }

  private isV3(spec: OAS.Document): spec is OpenAPIV3.Document {
    return (spec as OpenAPIV3.Document).openapi !== undefined;
  }
}
