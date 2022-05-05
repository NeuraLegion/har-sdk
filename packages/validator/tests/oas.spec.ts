import githubSwagger from './fixtures/oas2.github.json';
import petstoreSwagger from './fixtures/oas2.petstore.json';
import spoonacularOas from './fixtures/oas3.spoonacular.json';
import { OASValidator } from '../src';
import { ErrorObject } from 'ajv';
import yaml from 'js-yaml';
import { OpenAPIV2, OpenAPIV3 } from '@har-sdk/core';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

describe('OASValidator', () => {
  const validator = new OASValidator();

  describe('verify', () => {
    it('should successfully validate valid oas v2 document (GitHub, json)', async () => {
      const input: OpenAPIV2.Document =
        githubSwagger as unknown as OpenAPIV2.Document;

      const result = await validator.verify(input);

      expect(result).toMatchObject([]);
    });

    it('should successfully validate valid oas v2 document (Petstore, json)', async () => {
      const input: OpenAPIV2.Document =
        petstoreSwagger as unknown as OpenAPIV2.Document;

      const result = await validator.verify(input);

      expect(result).toMatchObject([]);
    });

    it('should successfully validate valid oas v3 document (Petstore, yaml)', async () => {
      const input: OpenAPIV3.Document = yaml.load(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/oas3.petstore.yaml'),
          'utf8'
        )
      ) as OpenAPIV3.Document;

      const result = await validator.verify(input);

      expect(result).toMatchObject([]);
    });

    it('should successfully validate valid oas v3 document (spoonacular, json)', async () => {
      const input: OpenAPIV3.Document = spoonacularOas as OpenAPIV3.Document;

      const result = await validator.verify(input);

      expect(result).toMatchObject([]);
    });

    it('should throw exception if cannot determine version of document', async () => {
      const input: OpenAPIV2.Document = {
        swagger: 'xyz',
        host: 'http://localhost:3000',
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };

      const result = validator.verify(input);

      await expect(result).rejects.toThrowError(
        'Unsupported or invalid specification version'
      );
    });

    it('should throw exception in case of unsupported schema version', async () => {
      const input: OpenAPIV2.Document = {
        swagger: '4.0.0',
        host: 'http://localhost:3000',
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };

      const result = validator.verify(input);

      await expect(result).rejects.toThrowError(
        'Unsupported or invalid specification version'
      );
    });

    it('should return error if oas v2 property `host` does not exist', async () => {
      const input: OpenAPIV2.Document = {
        swagger: '2.0',
        info: {
          title: 'Invalid OpenAPI document',
          version: '1.0.0'
        },
        paths: {}
      };

      const expected: ErrorObject[] = [
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

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });

    it('should return error if oas v3 property `servers` does not exist', async () => {
      const input: OpenAPIV3.Document = {
        openapi: '3.0.0',
        info: {
          title: 'Invalid OpenAPI document',
          version: '1.0.0'
        },
        paths: {}
      };

      const expected: ErrorObject[] = [
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

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });

    it('should return error if property `url` does not exist inside `servers`', async () => {
      const input: OpenAPIV3.Document = {
        openapi: '3.0.0',
        servers: [{}],
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      } as unknown as OpenAPIV3.Document;

      const expected: ErrorObject[] = [
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

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });

    it('should return error if `servers` does not contain at least one item', async () => {
      const input: OpenAPIV3.Document = {
        openapi: '3.0.0',
        servers: [],
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      } as unknown as OpenAPIV3.Document;

      const expected: ErrorObject[] = [
        {
          instancePath: '/servers',
          keyword: 'minItems',
          message: 'must NOT have fewer than 1 items',
          params: {
            limit: 1
          },
          schemaPath: '#/properties/servers/minItems'
        }
      ];

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });

    it('should return error if `servers[].url` is empty', async () => {
      const input: OpenAPIV3.Document = {
        openapi: '3.0.0',
        servers: [{ url: '' }],
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      } as unknown as OpenAPIV3.Document;

      const expected: ErrorObject[] = [
        {
          instancePath: '/servers/0/url',
          keyword: 'format',
          message: 'must match format "uri"',
          params: {
            format: 'uri'
          },
          schemaPath: '#/else/properties/url/format'
        }
      ];

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });

    it('should return error if `servers[].url` uses template syntax w/o declared variables', async () => {
      const input: OpenAPIV3.Document = {
        openapi: '3.0.0',
        servers: [{ url: 'http://example.com/search{?q,lang}' }],
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      } as unknown as OpenAPIV3.Document;

      const expected: ErrorObject[] = [
        {
          instancePath: '/servers/0/url',
          keyword: 'format',
          message: 'must match format "uri"',
          params: {
            format: 'uri'
          },
          schemaPath: '#/else/properties/url/format'
        }
      ];

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });

    it('should successfully validate `servers[].url` with template syntax if `variables` presents', async () => {
      const input: OpenAPIV3.Document = {
        openapi: '3.0.0',
        servers: [
          {
            url: '{protocol}://example.com/search{?q,lang}',
            variables: {}
          }
        ],
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      } as unknown as OpenAPIV3.Document;

      const result = await validator.verify(input);

      expect(result).toEqual([]);
    });
  });
});
