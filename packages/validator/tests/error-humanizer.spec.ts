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
          'Error at /paths: The property `paths` must have path names that start with "/"',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/paths',
            jsonPointer: '/paths'
          }
        ],
        messageParts: [
          {
            text: 'The property `paths` must have path names that start with "/"'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "required" error on root path', async () => {
      const { host, ...input } = getBaseSwaggerDoc();

      const expected = {
        message: 'Error at the schema root: The property `host` is required',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: 'the schema root',
            jsonPointer: ''
          }
        ],
        messageParts: [
          {
            text: 'The property `host` is required'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "enum" error message', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        schemes: ['https', 'file']
      };

      const expected = {
        message:
          'Error at /schemes/1: The property `schemes` must have one of the following values: "http", "https", "ws", or "wss"',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/schemes/1',
            jsonPointer: '/schemes/1'
          }
        ],
        messageParts: [
          {
            text: 'The property `schemes` must have one of the following values: "http", "https", "ws", or "wss"'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "type" error message for multiple items case', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        info: 42
      } as unknown as OpenAPIV2.Document;

      const expected = {
        message:
          'Error at /info: The property `info` must have a value of type `Object`',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/info',
            jsonPointer: '/info'
          }
        ],
        messageParts: [
          {
            text: 'The property `info` must have a value of type `Object`'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
          'Error at /item/0/response/0/body: The property `body` must have a value of type `Null` or `String`',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/item/0/response/0/body',
            jsonPointer: '/item/0/response/0/body'
          }
        ],
        messageParts: [
          {
            text: 'The property `body` must have a value of type `Null` or `String`'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "maxLength" error message', async () => {
      const input: Postman.Document = getBasePostmanDoc();
      (input.info.version as Postman.Version).identifier = 'id0123456789';

      const expected = {
        message:
          'Error at /info/version/identifier: The property `identifier` must have a value of length 10 or fewer characters',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/info/version/identifier',
            jsonPointer: '/info/version/identifier'
          }
        ],
        messageParts: [
          {
            text: 'The property `identifier` must have a value of length 10 or fewer characters'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "minimum" error message', async () => {
      const input: Postman.Document = getBasePostmanDoc();
      (input.info.version as Postman.Version).minor = -1;

      const expected = {
        message:
          'Error at /info/version/minor: The property `minor` must have a value equal to or greater than 0',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/info/version/minor',
            jsonPointer: '/info/version/minor'
          }
        ],
        messageParts: [
          {
            text: 'The property `minor` must have a value equal to or greater than 0'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
          'Error at /paths/~1x/get/responses/200/content/application~1json/schema/multipleOf: The property `multipleOf` must have a value greater than 0',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/paths/~1x/get/responses/200/content/application~1json/schema/multipleOf',
            jsonPointer:
              '/paths/~1x/get/responses/200/content/application~1json/schema/multipleOf'
          }
        ],
        messageParts: [
          {
            text: 'The property `multipleOf` must have a value greater than 0'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "pattern" error message', async () => {
      const input: OpenAPIV2.Document = {
        ...getBaseSwaggerDoc(),
        host: '{test}'
      };

      const expected = {
        message:
          'Error at /host: The property `host` must have a value that matches the pattern `^[^{}/ :\\\\]+(?::\\d+)?$`',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/host',
            jsonPointer: '/host'
          }
        ],
        messageParts: [
          {
            text: 'The property `host` must have a value that matches the pattern `^[^{}/ :\\\\]+(?::\\d+)?$`'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize string "format" error message', async () => {
      const input: OpenAPIV2.Document = getBaseSwaggerDoc();
      input.info.contact = {
        email: 'dummy'
      };

      const expected = {
        message:
          'Error at /info/contact/email: The property `email` must have a value that is a valid email address string',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/info/contact/email',
            jsonPointer: '/info/contact/email'
          }
        ],
        messageParts: [
          {
            text: 'The property `email` must have a value that is a valid email address string'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "additionalProperties" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        foo: 42
      } as OpenAPIV3.Document;

      const expected = {
        message: 'Error at the schema root: The property `foo` is unexpected',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: 'the schema root',
            jsonPointer: ''
          }
        ],
        messageParts: [
          {
            text: 'The property `foo` is unexpected'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
          'Error at the schema root: The properties `foo`, `bar`, and `baz` are unexpected',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: 'the schema root',
            jsonPointer: ''
          }
        ],
        messageParts: [
          {
            text: 'The properties `foo`, `bar`, and `baz` are unexpected'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

      result.should.deep.eq([expected]);
    });

    it('should humanize "uniqueItems" error message', async () => {
      const input: OpenAPIV3.Document = {
        ...getBaseOasDoc(),
        tags: [{ name: 'nl' }, { name: 'nl' }]
      };

      const expected = {
        message:
          'Error at /tags: must be unique but elements 0 and 1 are the same',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/tags',
            jsonPointer: '/tags'
          }
        ],
        messageParts: [
          {
            text: 'must be unique but elements 0 and 1 are the same'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
          'Error at /paths/~1x/get/responses/200/content/application~1json/schema/required: must have 1 or more items',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/paths/~1x/get/responses/200/content/application~1json/schema/required',
            jsonPointer:
              '/paths/~1x/get/responses/200/content/application~1json/schema/required'
          }
        ],
        messageParts: [
          {
            text: 'must have 1 or more items'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
          'Error at /paths/~1x/get/responses: The property `responses` must have 1 or more properties',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/paths/~1x/get/responses',
            jsonPointer: '/paths/~1x/get/responses'
          }
        ],
        messageParts: [
          {
            text: 'The property `responses` must have 1 or more properties'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
          'Error at /paths/~1item~1{itemId}/get/parameters/0/required: must be equal to constant "true"',
        locationParts: [
          {
            text: 'Error at'
          },
          {
            text: '/paths/~1item~1{itemId}/get/parameters/0/required',
            jsonPointer: '/paths/~1item~1{itemId}/get/parameters/0/required'
          }
        ],
        messageParts: [
          {
            text: 'must be equal to constant "true"'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await oasValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
          'Error at /item/0/request/body/formdata/0/type: must be one of: "text" or "file"',
        locationParts: [
          { text: 'Error at' },
          {
            text: '/item/0/request/body/formdata/0/type',
            jsonPointer: '/item/0/request/body/formdata/0/type'
          }
        ],
        messageParts: [
          {
            text: 'must be one of: "text" or "file"'
          }
        ]
      };

      const result = humanizer
        .humanizeErrors(await postmanValidator.verify(input))
        .map(({ originalError, ...rest }) => ({ ...rest }));

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
        'Error at /item/0/request/body/formdata/0: The property `key` is required',
      locationParts: [
        {
          text: 'Error at'
        },
        {
          text: '/item/0/request/body/formdata/0',
          jsonPointer: '/item/0/request/body/formdata/0'
        }
      ],
      messageParts: [
        {
          text: 'The property `key` is required'
        }
      ]
    };

    const result = humanizer
      .humanizeErrors(await postmanValidator.verify(input))
      .map(({ originalError, ...rest }) => ({ ...rest }));

    result.should.deep.eq([expected]);
  });
});
