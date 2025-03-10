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

      expect(result).toEqual([]);
    });

    it('should successfully validate valid oas v2 document (Petstore, json)', async () => {
      const input: OpenAPIV2.Document =
        petstoreSwagger as unknown as OpenAPIV2.Document;

      const result = await validator.verify(input);

      expect(result).toEqual([]);
    });

    it('should successfully validate valid oas v3 document (Petstore, yaml)', async () => {
      const input: OpenAPIV3.Document = yaml.load(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/oas3.petstore.yaml'),
          'utf8'
        )
      ) as OpenAPIV3.Document;

      const result = await validator.verify(input);

      expect(result).toEqual([]);
    });

    it('should successfully validate valid oas v3 document (spoonacular, json)', async () => {
      const input: OpenAPIV3.Document = spoonacularOas as OpenAPIV3.Document;

      const result = await validator.verify(input);

      expect(result).toEqual([]);
    });

    it('should successfully validate valid oas v3.1 with dynamicAnchor & dynamicRef', async () => {
      const input: OpenAPIV3.Document = yaml.load(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/oas3.1.dynamic.yaml'),
          'utf8'
        )
      ) as OpenAPIV3.Document;

      const result = await validator.verify(input);

      expect(result).toEqual([]);
    });

    it.each(['oas3.1.discriminator.yaml', 'oas3.1.petstore.yaml'])(
      'should successfully validate valid oas v3.1 document %s',
      async (input) => {
        const spec: OpenAPIV3.Document = yaml.load(
          await promisify(readFile)(
            resolve(__dirname, `./fixtures/${input}`),
            'utf8'
          )
        ) as OpenAPIV3.Document;

        const result = await validator.verify(spec);

        expect(result).toEqual([]);
      }
    );

    it('should successfully validate when when validation happens concurrently', async () => {
      const input1: OpenAPIV3.Document = yaml.load(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/oas3.1.petstore.yaml'),
          'utf8'
        )
      ) as OpenAPIV3.Document;

      const input2: OpenAPIV3.Document = yaml.load(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/oas3.petstore.yaml'),
          'utf8'
        )
      ) as OpenAPIV3.Document;

      const input3: OpenAPIV3.Document = JSON.parse(
        await promisify(readFile)(
          resolve(__dirname, './fixtures/oas2.petstore.json'),
          'utf8'
        )
      ) as OpenAPIV3.Document;

      const [result1, result2, result3]: [
        ErrorObject[],
        ErrorObject[],
        ErrorObject[]
      ] = await Promise.all([
        validator.verify(input1),
        validator.verify(input2),
        validator.verify(input3)
      ]);

      expect([...result1, ...result2, ...result3]).toEqual([]);
    });

    it.each(['3.0.0', '3.1.0'])(
      'should return error if oas %s `discriminator` miss `propertyName`',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
          info: {
            title: 'Animal API',
            version: '1.0.0'
          },
          servers: [
            {
              url: 'https://example.com/api/v1'
            }
          ],
          paths: {
            '/animals': {
              post: {
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Animal'
                      }
                    }
                  }
                },
                responses: {
                  '200': {
                    description: '',
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/Animal'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          components: {
            schemas: {
              Animal: {
                type: 'object',
                required: ['type'],
                properties: {
                  type: {
                    type: 'string'
                  },
                  name: {
                    type: 'string'
                  }
                },
                discriminator: {
                  mapping: {
                    cat: '#/components/schemas/Cat',
                    dog: '#/components/schemas/Dog'
                  }
                }
              },
              Cat: {
                allOf: [
                  {
                    $ref: '#/components/schemas/Animal'
                  },
                  {
                    type: 'object',
                    properties: {
                      livesLeft: {
                        type: 'integer'
                      }
                    }
                  }
                ]
              },
              Dog: {
                allOf: [
                  {
                    $ref: '#/components/schemas/Animal'
                  },
                  {
                    type: 'object',
                    properties: {
                      breed: {
                        type: 'string'
                      }
                    }
                  }
                ]
              }
            },
            examples: {
              CatExample: {
                value: {
                  type: 'cat',
                  name: 'Whiskers',
                  livesLeft: 9
                }
              },
              DogExample: {
                value: {
                  type: 'dog',
                  name: 'Buddy',
                  breed: 'Golden Retriever'
                }
              }
            }
          }
        } as unknown as OpenAPIV3.Document;

        const expected: ErrorObject[] = [
          {
            instancePath: '/components/schemas/Animal/discriminator',
            keyword: 'required',
            message: "must have required property 'propertyName'",
            params: {
              missingProperty: 'propertyName'
            },
            schemaPath: expect.anything()
          }
        ];

        const result = await validator.verify(spec);

        expect(result).toEqual(expected);
      }
    );

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

    it.each(['3.0.0', '3.1.0'])(
      'should return error if oas $input operation `responses` does not contain response',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
          info: {
            title: 'Invalid OpenAPI document',
            version: '1.0.0'
          },
          servers: [{ url: 'https://example.com' }],
          paths: {
            '/users': {
              get: {
                responses: {
                  'x-response': {
                    description: 'A simple response'
                  }
                }
              }
            }
          }
        };

        const result = await validator.verify(spec);

        expect(result).toMatchObject([
          {
            instancePath: '/paths/~1users/get/responses',
            keyword: 'errorMessage',
            message:
              'The property `response` must define at least one response, in addition to any vendor extension (`x-*`) fields',
            params: {
              errors: [
                {
                  instancePath: '/paths/~1users/get/responses',
                  keyword: 'not',
                  message: 'must NOT be valid'
                }
              ]
            },
            schemaPath: '#/errorMessage'
          }
        ]);
      }
    );

    it.each([
      {
        input: '3.0.0',
        expected: {
          keyword: 'additionalProperties',
          message: 'must NOT have additional properties',
          params: {
            additionalProperty: 'response'
          }
        }
      },
      {
        input: '3.1.0',
        expected: {
          keyword: 'unevaluatedProperties',
          message: 'must NOT have unevaluated properties',
          params: {
            unevaluatedProperty: 'response'
          }
        }
      }
    ])(
      'should return error if oas $input operation `responses` is malformed',
      async ({ input, expected }) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
          info: {
            title: 'Invalid OpenAPI document',
            version: '1.0.0'
          },
          servers: [{ url: 'https://example.com' }],
          paths: {
            '/users': {
              get: {
                responses: {
                  response: {
                    description: 'A simple response'
                  }
                }
              }
            }
          }
        };

        const result = await validator.verify(spec);

        expect(result).toMatchObject([
          {
            instancePath: '/paths/~1users/get/responses',
            keyword: 'errorMessage',
            message:
              'The property `response` must have the following values: three-digit status codes, `default`, and vendor extensions (`x-*`)',
            params: {
              errors: [expected]
            },
            schemaPath: '#/errorMessage'
          }
        ]);
      }
    );

    it.each(['3.0.0', '3.1.0'])(
      'should return error if oas %s property `servers` does not exist',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
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

        const result = await validator.verify(spec);

        expect(result).toEqual(expected);
      }
    );

    it.each(['3.0.0', '3.1.0'])(
      'should return error if oas %s property `url` does not exist inside `servers`',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
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

        const result = await validator.verify(spec);

        expect(result).toEqual(expected);
      }
    );

    it.each(['3.0.0', '3.1.0'])(
      'should return error if oas %s `servers` does not contain at least one item',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
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

        const result = await validator.verify(spec);

        expect(result).toEqual(expected);
      }
    );

    it.each(['3.0.0', '3.1.0'])(
      'should return error if oas %s `servers[].url` is empty',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
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

        const result = await validator.verify(spec);

        expect(result).toEqual(expected);
      }
    );

    it.each(['3.0.0', '3.1.0'])(
      'should return error if oas %s `servers[].url` uses template syntax w/o declared variables',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
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

        const result = await validator.verify(spec);

        expect(result).toEqual(expected);
      }
    );

    it.each(['3.0.0', '3.1.0'])(
      'should successfully validate oas %s `servers[].url` with template syntax if `variables` presents',
      async (input) => {
        const spec: OpenAPIV3.Document = {
          openapi: input,
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

        const result = await validator.verify(spec);

        expect(result).toEqual([]);
      }
    );
  });
});
