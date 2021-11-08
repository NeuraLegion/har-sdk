import githubSwagger from './oas2.github.json';
import petstoreSwagger from './oas2.petstore.json';
import { OASValidator } from '../src';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import yaml from 'js-yaml';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import 'chai/register-should';

use(chaiAsPromised);

describe('OASValidator', () => {
  const validator = new OASValidator();

  describe('verify', () => {
    it('should successfully validate valid oas v2 document (GitHub, json)', async () => {
      const result = await validator.verify(
        githubSwagger as unknown as OpenAPIV2.Document
      );
      result.should.be.empty;
    });

    it('should successfully validate valid oas v2 document (Petstore, json)', async () => {
      const result = await validator.verify(
        petstoreSwagger as unknown as OpenAPIV2.Document
      );
      result.should.be.empty;
    });

    it('should successfully validate valid oas v3 document (Petstore, yaml)', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/oas3.petstore.yaml'),
        'utf8'
      );

      const result = await validator.verify(
        yaml.load(content) as OpenAPIV3.Document
      );
      result.should.be.empty;
    });

    it('should throw exception if cannot determine version of document', async () => {
      const apiDoc = {
        swagger: 'xyz',
        host: 'http://localhost:3000',
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };

      return validator
        .verify(apiDoc as unknown as OpenAPIV2.Document)
        .should.be.rejectedWith(
          Error,
          'Unsupported or invalid specification version'
        );
    });

    it('should throw exception in case of unsupported schema version', async () => {
      const apiDoc = {
        swagger: '4.0.0',
        host: 'http://localhost:3000',
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };

      return validator
        .verify(apiDoc as unknown as OpenAPIV2.Document)
        .should.be.rejectedWith(
          Error,
          'Unsupported or invalid specification version'
        );
    });

    it('should return error if oas v2 property `host` does not exist', async () => {
      const apiDoc = {
        swagger: '2.0',
        info: {
          title: 'Invalid OpenAPI document',
          version: '1.0.0'
        },
        paths: {}
      };

      const result = await validator.verify(
        apiDoc as unknown as OpenAPIV2.Document
      );

      result.should.deep.eq([
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'host'",
          params: {
            missingProperty: 'host'
          },
          schemaPath: '#/required'
        }
      ]);
    });

    it('should return error if oas v3 property `servers` does not exist', async () => {
      const apiDoc = {
        openapi: '3.0.0',
        info: {
          title: 'Invalid OpenAPI document',
          version: '1.0.0'
        },
        paths: {}
      };

      const result = await validator.verify(
        apiDoc as unknown as OpenAPIV3.Document
      );

      result.should.deep.eq([
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'servers'",
          params: {
            missingProperty: 'servers'
          },
          schemaPath: '#/required'
        }
      ]);
    });

    it('should return error if property `url` does not exist inside `servers`', async () => {
      const apiDoc = {
        openapi: '3.0.0',
        servers: [{}],
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };
      const errors = [
        {
          instancePath: '/servers/0',
          keyword: 'required',
          message: "must have required property 'url'",
          params: {
            missingProperty: 'url'
          },
          schemaPath: '#/required'
        }
      ];

      const result = await validator.verify(
        apiDoc as unknown as OpenAPIV3.Document
      );
      result.should.deep.eq(errors);
    });
  });
});
