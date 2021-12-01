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

      const expected = {
        message:
          'the value at /paths should only have path names that start with `/`',
        messageParts: [
          {
            text: 'the value at /paths',
            jsonPointer: '/paths'
          },
          {
            text: 'should only have path names that start with `/`'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "required" error on root path', async () => {
      const { host, ...input } = getBaseSwaggerDoc();

      const expected = {
        message: 'the root value is missing the required field `host`',
        messageParts: [
          {
            text: 'the root value',
            jsonPointer: ''
          },
          {
            text: 'is missing the required field `host`'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "enum" error message', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        schemes: ['https', 'file']
      };

      const expected = {
        message:
          'the value at /schemes/1 must be one of: "http", "https", "ws", or "wss"',
        messageParts: [
          {
            text: 'the value at /schemes/1',
            jsonPointer: '/schemes/1'
          },
          {
            text: 'must be one of: "http", "https", "ws", or "wss"'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "type" error message for multiple items case', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        info: 42
      } as unknown as OpenAPIV2.Document;

      const expected = {
        message: 'the value at /info must be of type object',
        messageParts: [
          {
            text: 'the value at /info',
            jsonPointer: '/info'
          },
          {
            text: 'must be of type object'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
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

      const expected = {
        message:
          'the value at /item/0/response/0/body must be of type null or string',
        messageParts: [
          {
            text: 'the value at /item/0/response/0/body',
            jsonPointer: '/item/0/response/0/body'
          },
          {
            text: 'must be of type null or string'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "maxLength" error message', async () => {
      const input: Postman.Document = getBasePostmanDoc();
      (input.info.version as Postman.Version).identifier = 'id0123456789';

      const expected = {
        message:
          'the value at /info/version/identifier must be of length 10 or fewer',
        messageParts: [
          {
            text: 'the value at /info/version/identifier',
            jsonPointer: '/info/version/identifier'
          },
          {
            text: 'must be of length 10 or fewer'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "minimum" error message', async () => {
      const input: Postman.Document = getBasePostmanDoc();
      (input.info.version as Postman.Version).minor = -1;

      const expected = {
        message:
          'the value at /info/version/minor must be equal to or greater than 0',
        messageParts: [
          {
            text: 'the value at /info/version/minor',
            jsonPointer: '/info/version/minor'
          },
          {
            text: 'must be equal to or greater than 0'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
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

      const expected = {
        message:
          'the value at /paths/~1x/get/responses/200/content/application~1json/schema/multipleOf must be greater than 0',
        messageParts: [
          {
            text: 'the value at /paths/~1x/get/responses/200/content/application~1json/schema/multipleOf',
            jsonPointer:
              '/paths/~1x/get/responses/200/content/application~1json/schema/multipleOf'
          },
          {
            text: 'must be greater than 0'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "pattern" error message', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        host: '{test}'
      };

      const expected = {
        message:
          'the value at /host does not match pattern ^[^{}/ :\\\\]+(?::\\d+)?$',
        messageParts: [
          {
            text: 'the value at /host',
            jsonPointer: '/host'
          },
          {
            text: 'does not match pattern ^[^{}/ :\\\\]+(?::\\d+)?$'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize string "format" error message', async () => {
      const input: OpenAPIV2.Document = getBaseSwaggerDoc();
      input.info.contact = {
        email: 'dummy'
      };

      const expected = {
        message:
          'the value at /info/contact/email must be a valid email address string',
        messageParts: [
          {
            text: 'the value at /info/contact/email',
            jsonPointer: '/info/contact/email'
          },
          {
            text: 'must be a valid email address string'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "additionalProperties" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        foo: 42
      } as OpenAPIV3.Document;

      const expected = {
        message: 'the root value has an unexpected property `foo`',
        messageParts: [
          {
            text: 'the root value',
            jsonPointer: ''
          },
          {
            text: 'has an unexpected property `foo`'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "additionalProperties" error message with multiple properties', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        foo: 42,
        bar: 42,
        baz: 42
      } as OpenAPIV3.Document;

      const expected = {
        message:
          'the root value has an unexpected properties `foo`, `bar`, and `baz`',
        messageParts: [
          {
            text: 'the root value',
            jsonPointer: ''
          },
          {
            text: 'has an unexpected properties `foo`, `bar`, and `baz`'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "uniqueItems" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        tags: [{ name: 'nl' }, { name: 'nl' }]
      };

      const expected = {
        message:
          'the value at /tags must be unique but elements 0 and 1 are the same',
        messageParts: [
          {
            text: 'the value at /tags',
            jsonPointer: '/tags'
          },
          {
            text: 'must be unique but elements 0 and 1 are the same'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
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

      const expected = {
        message:
          'the value at /paths/~1x/get/responses/200/content/application~1json/schema/required must have 1 or more items',
        messageParts: [
          {
            text: 'the value at /paths/~1x/get/responses/200/content/application~1json/schema/required',
            jsonPointer:
              '/paths/~1x/get/responses/200/content/application~1json/schema/required'
          },
          {
            text: 'must have 1 or more items'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
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

      const expected = {
        message:
          'the value at /paths/~1x/get/responses must have 1 or more properties',
        messageParts: [
          {
            text: 'the value at /paths/~1x/get/responses',
            jsonPointer: '/paths/~1x/get/responses'
          },
          {
            text: 'must have 1 or more properties'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
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

      const expected = {
        message:
          'the value at /paths/~1item~1{itemId}/get/parameters/0/required must be equal to constant "true"',
        messageParts: [
          {
            text: 'the value at /paths/~1item~1{itemId}/get/parameters/0/required',
            jsonPointer: '/paths/~1item~1{itemId}/get/parameters/0/required'
          },
          {
            text: 'must be equal to constant "true"'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });

    it('should properly humanize "anyOf" postman formdata case with invalid type', async () => {
      const input: Postman.Document = {
        ...getBasePostmanDoc(),
        item: [
          {
            request: {
              url: 'http://localhost/create',
              method: 'POST',
              body: {
                formdata: [
                  {
                    key: 'foo',
                    value: 'bar',
                    type: 'invalidType'
                  }
                ]
              }
            },
            response: []
          }
        ]
      } as unknown as Postman.Document;

      const expected = {
        message:
          'the value at /item/0/request/body/formdata/0/type must be one of: "text" or "file"',
        messageParts: [
          {
            text: 'the value at /item/0/request/body/formdata/0/type',
            jsonPointer: '/item/0/request/body/formdata/0/type'
          },
          {
            text: 'must be one of: "text" or "file"'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ message, messageParts }) => ({ message, messageParts }));

      result.should.deep.eq([expected]);
    });
  });

  it('should properly humanize "anyOf" postman formdata case with missing key', async () => {
    const input: Postman.Document = {
      ...getBasePostmanDoc(),
      item: [
        {
          request: {
            url: 'http://localhost/create',
            method: 'POST',
            body: {
              formdata: [
                {
                  value: 'bar',
                  type: 'text'
                }
              ]
            }
          },
          response: []
        }
      ]
    } as unknown as Postman.Document;

    const expected = {
      message:
        'the value at /item/0/request/body/formdata/0 is missing the required field `key`',
      messageParts: [
        {
          text: 'the value at /item/0/request/body/formdata/0',
          jsonPointer: '/item/0/request/body/formdata/0'
        },
        {
          text: 'is missing the required field `key`'
        }
      ]
    };

    const result = humanizer
      .humanizeErrors(await postmanValidator.verify(input))
      .map(({ message, messageParts }) => ({ message, messageParts }));

    result.should.deep.eq([expected]);
  });
});
