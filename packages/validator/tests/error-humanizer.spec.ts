import { ErrorHumanizer, OASValidator, PostmanValidator } from '../src';
import { OpenAPIV2, Postman, OpenAPIV3 } from '@har-sdk/types';
import 'chai/register-should';

describe('ErrorHumanizer', () => {
  const oasValidator = new OASValidator();
  const postmanValidator = new PostmanValidator();
  const humanizer = new ErrorHumanizer();

  const getBasePostmanDoc = (): Postman.Document => ({
    info: {
      name: 'Invalid Postman document',
      schema:
        'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
      version: {
        major: 1,
        minor: 0,
        patch: 0
      }
    },
    item: [] as any,
    variable: []
  });

  const getBaseSwaggerDoc = (): OpenAPIV2.Document => ({
    swagger: '2.0',
    host: 'localhost',
    info: {
      title: 'Invalid Swagger document',
      version: '1.0.0'
    },
    paths: {}
  });

  const getBaseOasDoc = (): OpenAPIV3.Document => ({
    openapi: '3.0.1',
    servers: [{ url: 'localhost' }],
    info: {
      title: 'Invalid OpenAPI document',
      version: '1.0.0'
    },
    paths: {}
  });

  describe('humanizeErrors', () => {
    it('should return original "errorMessage" if exists', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        paths: {
          path1: {}
        }
      };

      const expectedMessage =
        'the value at /paths should only have path names that start with `/`';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "required" error on root path', async () => {
      const { host, ...input } = getBaseSwaggerDoc();

      const expectedMessage =
        "the root value is missing the required field 'host'";

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "enum" error message', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        schemes: ['https', 'file']
      };

      const expectedMessage =
        'the value at /schemes/1 must be one of: "http", "https", "ws", or "wss"';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "type" error message for multiple items case', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        info: 42
      } as unknown as OpenAPIV2.Document;

      const expectedMessage = 'the value at /info must be of type object';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "type" error message for two items case', async () => {
      const input: Postman.Document = {
        ...getBasePostmanDoc(),
        item: [
          {
            request: {},
            response: [
              {
                body: 42
              }
            ]
          }
        ]
      } as unknown as Postman.Document;

      const expectedMessage =
        'the value at /item/0/response/0/body must be of type null or string';

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "maxLength" error message', async () => {
      const input: Postman.Document = getBasePostmanDoc();
      (input.info.version as Postman.Version).identifier = 'id0123456789';

      const expectedMessage =
        'the value at /info/version/identifier must be of length 10 or fewer';

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "minimum" error message', async () => {
      const input: Postman.Document = getBasePostmanDoc();
      (input.info.version as Postman.Version).minor = -1;

      const expectedMessage =
        'the value at /info/version/minor must be equal to or greater than 0';

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "exclusiveMinimum" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        paths: {
          '/x': {
            get: {
              responses: {
                '200': {
                  description: 'dummy',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'integer',
                        multipleOf: -1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const expectedMessage =
        'the value at /paths/~1x/get/responses/200/content/application~1json/schema/multipleOf must be greater than 0';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "pattern" error message', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        host: '{test}'
      };

      const expectedMessage =
        'the value at /host does not match pattern ^[^{}/ :\\\\]+(?::\\d+)?$';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize string "format" error message', async () => {
      const input: OpenAPIV2.Document = getBaseSwaggerDoc();
      input.info.contact = {
        email: 'dummy'
      };

      const expectedMessage =
        'the value at /info/contact/email must be a valid email address string';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "additionalProperties" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        foo: 42
      } as OpenAPIV3.Document;

      const expectedMessage = 'the root value has an unexpected property "foo"';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "uniqueItems" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        tags: [{ name: 'nl' }, { name: 'nl' }]
      };

      const expectedMessage =
        'the value at /tags must be unique but elements 0 and 1 are the same';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "minItems" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        paths: {
          '/x': {
            get: {
              responses: {
                '200': {
                  description: 'dummy',
                  content: {
                    'application/json': {
                      schema: {
                        required: []
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const expectedMessage =
        'the value at /paths/~1x/get/responses/200/content/application~1json/schema/required must have 1 or more items';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "minProperties" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        paths: {
          '/x': {
            get: {
              responses: {}
            }
          }
        }
      };

      const expectedMessage =
        'the value at /paths/~1x/get/responses must have 1 or more properties';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });

    it('should humanize "const" error message', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        paths: {
          '/item/{itemId}': {
            get: {
              parameters: [
                {
                  name: 'petId',
                  in: 'path',
                  required: false,
                  type: 'integer',
                  format: 'int64'
                }
              ],
              responses: {
                '200': {
                  description: 'success'
                }
              }
            }
          }
        }
      };

      const expectedMessage =
        'the value at /paths/~1item~1{itemId}/get/parameters/0/required must be equal to constant "true"';

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map((error) => error.message);

      result.should.deep.eq([expectedMessage]);
    });
  });
});
