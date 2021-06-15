import githubSwagger from './github_swagger.json';
// import githubSwagger from './petstore_swagger.json';
import { OASValidator } from '../src';
import yaml from 'js-yaml';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/types';
import { expect } from 'chai';
import { resolve } from 'path';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

describe('OASValidator', async () => {
  const validator = new OASValidator();

  describe('verify', async () => {
    it('should successfully validate GitHub swagger v2 JSON', async () => {
      const result = await validator.verify(
        githubSwagger as unknown as OpenAPIV2.Document
      );
      // eslint-disable-next-line no-console
      console.log(result.errors);
      expect(result.errors.length).to.be.equal(0);
    });

    it('should successfully validate Petstore OpenApi v3 YAML', async () => {
      const content: string = await readFile(
        resolve('./tests/petstore_oas.yaml'),
        'utf8'
      );

      const result = await validator.verify(
        yaml.load(content) as OpenAPIV3.Document
      );
      expect(result.errors.length).to.be.equal(0);
    });

    it('V2 invalid JSON: cannot determine version of document', async () => {
      const apiDoc = {
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };

      try {
        await validator.verify(apiDoc as unknown as OpenAPIV2.Document);
      } catch (err) {
        expect(err.message).to.be.equal(
          'Cannot determine version of schema. Schema ID is missed.'
        );
      }
    });

    it('V2 invalid JSON: invalid version', async () => {
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
        expect(err.message).to.be.equal(
          'Cannot determine version of schema. Schema ID is missed.'
        );
      }
    });

    it('V2 invalid JSON: invalid host', async () => {
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
      expect(result.errors).to.deep.equal(errors);
    });

    it('V3 invalid JSON: invalid servers', async () => {
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
      expect(result.errors).to.deep.equal(errors);
    });

    it('V3 invalid JSON: invalid server url', async () => {
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
      expect(result.errors).to.deep.equal(errors);
    });
  });
});
