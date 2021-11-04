import { ErrorHumanizer } from '../src/humanizer';
import { OASValidator, PostmanValidator } from '../src';
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

  it('should return original "errorMessage" if exists', async () => {
    const apiDoc: OpenAPIV2.Document = {
      ...getBaseSwaggerDoc(),
      paths: {
        path1: {}
      }
    };

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /paths should only have path names that start with `/`'
    ]);
  });

  it('should humanize "required" error on root path', async () => {
    const { host, ...apiDoc } = getBaseSwaggerDoc();

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      "the root value is missing the required field 'host'"
    ]);
  });

  it('should humanize "enum" error message', async () => {
    const apiDoc: OpenAPIV2.Document = {
      ...getBaseSwaggerDoc(),
      schemes: ['https', 'file']
    };

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /schemes/1 must be one of: "http", "https", "ws", or "wss"'
    ]);
  });

  it('should humanize "type" error message for multiple items case', async () => {
    const apiDoc: OpenAPIV2.Document = {
      ...getBaseSwaggerDoc(),
      info: 42
    } as unknown as OpenAPIV2.Document;

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq(['the value at /info must be of type object']);
  });

  it('should humanize "type" error message for two items case', async () => {
    const apiDoc: Postman.Document = {
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

    const result = humanizer
      .humanizeErrors(await postmanValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /item/0/response/0/body must be of type null or string'
    ]);
  });

  it('should humanize "maxLength" error message', async () => {
    const apiDoc: Postman.Document = getBasePostmanDoc();
    (apiDoc.info.version as Postman.Version).identifier = 'id0123456789';

    const result = humanizer
      .humanizeErrors(await postmanValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /info/version/identifier must be of length 10 or fewer'
    ]);
  });

  it('should humanize "minimum" error message', async () => {
    const apiDoc: Postman.Document = getBasePostmanDoc();
    (apiDoc.info.version as Postman.Version).minor = -1;

    const result = humanizer
      .humanizeErrors(await postmanValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /info/version/minor must be equal to or greater than 0'
    ]);
  });

  it('should humanize "exclusiveMinimum" error message', async () => {
    const apiDoc: OpenAPIV3.Document = {
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

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /paths/~1x/get/responses/200/content/application~1json/schema/multipleOf must be greater than 0'
    ]);
  });

  it('should humanize "pattern" error message', async () => {
    const apiDoc: OpenAPIV2.Document = {
      ...getBaseSwaggerDoc(),
      host: '{test}'
    };

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /host does not match pattern ^[^{}/ :\\\\]+(?::\\d+)?$'
    ]);
  });

  it('should humanize string "format" error message', async () => {
    const apiDoc: OpenAPIV2.Document = getBaseSwaggerDoc();
    apiDoc.info.contact = {
      email: 'dummy'
    };

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /info/contact/email must be a valid email address string'
    ]);
  });

  it('should humanize "additionalProperties" error message', async () => {
    const apiDoc: OpenAPIV3.Document = {
      ...getBaseOasDoc(),
      foo: 42
    } as OpenAPIV3.Document;

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq(['the root value has an unexpected property "foo"']);
  });

  it('should humanize "uniqueItems" error message', async () => {
    const apiDoc: OpenAPIV3.Document = {
      ...getBaseOasDoc(),
      tags: [{ name: 'nl' }, { name: 'nl' }]
    };

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /tags must be unique but elements 0 and 1 are the same'
    ]);
  });

  it('should humanize "minItems" error message', async () => {
    const apiDoc: OpenAPIV3.Document = {
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

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /paths/~1x/get/responses/200/content/application~1json/schema/required must have 1 or more items'
    ]);
  });

  it('should humanize "minProperties" error message', async () => {
    const apiDoc: OpenAPIV3.Document = {
      ...getBaseOasDoc(),
      paths: {
        '/x': {
          get: {
            responses: {}
          }
        }
      }
    };

    const result = humanizer
      .humanizeErrors(await oasValidator.validate(apiDoc))
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /paths/~1x/get/responses must have 1 or more properties'
    ]);
  });
});
