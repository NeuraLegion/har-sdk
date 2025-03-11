import { Validator } from './Validator';
import { SwaggerValidator } from './SwaggerValidator';
import { OAS3Validator } from './OAS3Validator';
import { OAS3_1Validator } from './OAS3_1Validator';
import semver from 'semver';
import { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from '@har-sdk/core';
import { ErrorObject } from 'ajv';

export class OASValidator implements Validator<OpenAPI.Document> {
  private readonly validators: ReadonlyMap<
    string,
    Validator<OpenAPI.Document>
  > = new Map(
    Object.entries({
      '2.x.x': new SwaggerValidator(),
      '3.0.x': new OAS3Validator(),
      '3.1.x': new OAS3_1Validator()
    })
  );

  public async verify(document: OpenAPI.Document): Promise<ErrorObject[]> {
    const version = this.extractSpecVersion(document);
    const validator = this.getValidator(version);

    if (!validator) {
      throw new Error('Unsupported or invalid specification version');
    }

    return validator.verify(document);
  }

  private extractSpecVersion(
    document: OpenAPIV2.Document | OpenAPIV3.Document | OpenAPIV3_1.Document
  ): string {
    const version = (
      'openapi' in document
        ? document.openapi
        : (document as OpenAPIV2.Document).swagger || ''
    ).trim();

    return semver.coerce(version)?.format() ?? '';
  }

  private getValidator(
    version: string
  ): Validator<OpenAPI.Document> | undefined {
    const [, validator]: [string?, Validator<OpenAPI.Document>?] =
      [...this.validators].find(
        ([range, v]: [string, Validator<OpenAPI.Document>]) =>
          semver.satisfies(version, range) ? v : undefined
      ) ?? [];

    return validator;
  }
}
