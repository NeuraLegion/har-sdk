import githubSwagger from './githubSwagger.json';
import { OASValidator } from '../src';
import yaml from 'js-yaml';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';
import { resolve } from 'path';
import fs from 'fs';
import { promisify } from 'util';
import 'chai/register-should';

const readFile = promisify(fs.readFile);

describe('OASValidator', () => {
  const validator = new OASValidator();

  describe('verify', () => {
    it('should successfully validate GitHub swagger v2 JSON', async () => {
      const result = await validator.verify(
        githubSwagger as unknown as OpenAPIV2.Document
      );
      result.errors.should.be.empty;
    });

    it('should successfully validate Petstore OpenApi v3 YAML', async () => {
      const content: string = await readFile(
        resolve('./tests/petstoreOas.yaml'),
        'utf8'
      );

      const result = await validator.verify(
        yaml.load(content) as OpenAPIV3.Document
      );
      result.errors.should.be.empty;
    });

    it('should throw error if cannot determine version of schema because of schema ID is missed.', async () => {
      const apiDoc = {
        swagger: '1.0.0',
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };

      try {
        await validator.verify(apiDoc as unknown as OpenAPIV2.Document);
      } catch (err) {
        err.message.should.be.equal(
          'Cannot determine version of schema. Schema ID is missed.'
        );
      }
    });

    it("should throw error if property 'host' does not exist", async () => {
      const apiDoc = {
        swagger: '2.0',
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };
      const errors = [
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'host'",
          params: {
            missingProperty: 'host'
          },
          schemaPath: '#/required'
        }
      ];

      const result = await validator.verify(
        apiDoc as unknown as OpenAPIV2.Document
      );
      result.errors.should.deep.eq(errors);
    });

    it("should throw error if property 'servers' does not exist", async () => {
      const apiDoc = {
        openapi: '3.0.0',
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };
      const errors = [
        {
          instancePath: '',
          keyword: 'required',
          message: "must have required property 'servers'",
          params: {
            missingProperty: 'servers'
          },
          schemaPath: '#/required'
        }
      ];

      const result = await validator.verify(
        apiDoc as unknown as OpenAPIV3.Document
      );
      result.errors.should.deep.eq(errors);
    });

    it("should throw error if property 'url' does not exist", async () => {
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
      result.errors.should.deep.eq(errors);
    });
  });
});
