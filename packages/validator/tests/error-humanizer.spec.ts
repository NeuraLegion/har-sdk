import { ErrorHumanizer } from '../src/humanizer';
import { OASValidator, PostmanValidator } from '../src';
import { OpenAPIV2, Postman } from '@har-sdk/types';
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
      title: 'Invalid OpenAPI document',
      version: '1.0.0'
    },
    paths: {}
  });

  it('should return original "errorMessage" if exists', async () => {
    const apiDoc = {
      ...getBaseSwaggerDoc(),
      paths: {
        path1: {}
      }
    };

    const result = humanizer
      .humanizeErrors(
        await oasValidator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /paths should only have path names that start with `/`'
    ]);
  });

  it('should humanize "required" error on root path', async () => {
    const { host, ...apiDoc } = getBaseSwaggerDoc();

    const result = humanizer
      .humanizeErrors(
        await oasValidator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      "the root value is missing the required field 'host'"
    ]);
  });

  it('should humanize "enum" error message', async () => {
    const apiDoc = {
      ...getBaseSwaggerDoc(),
      schemes: ['https', 'file']
    };

    const result = humanizer
      .humanizeErrors(
        await oasValidator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /schemes/1 must be one of: "http", "https", "ws", or "wss"'
    ]);
  });

  it('should humanize "type" error message', async () => {
    const apiDoc = {
      ...getBaseSwaggerDoc(),
      info: 42
    };

    const result = humanizer
      .humanizeErrors(
        await oasValidator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq(['the value at /info must be an object']);
  });

  it('should humanize "maxLength" error message', async () => {
    const apiDoc = getBasePostmanDoc();
    (apiDoc.info.version as Postman.Version).identifier = 'id0123456789';

    const result = humanizer
      .humanizeErrors(
        await postmanValidator.validate(apiDoc as unknown as Postman.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /info/version/identifier must be 10 characters or fewer'
    ]);
  });

  it('should humanize "minimum" error message', async () => {
    const apiDoc = getBasePostmanDoc();
    (apiDoc.info.version as Postman.Version).minor = -1;

    const result = humanizer
      .humanizeErrors(
        await postmanValidator.validate(apiDoc as unknown as Postman.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /info/version/minor must be equal to or greater than 0'
    ]);
  });

  it('should humanize "pattern" error message', async () => {
    const apiDoc = {
      ...getBaseSwaggerDoc(),
      host: '{test}'
    };

    const result = humanizer
      .humanizeErrors(
        await oasValidator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /host does not match pattern ^[^{}/ :\\\\]+(?::\\d+)?$'
    ]);
  });

  it('should humanize string "format" error message', async () => {
    const apiDoc = getBaseSwaggerDoc();
    apiDoc.info.contact = {
      email: 'dummy'
    };

    const result = humanizer
      .humanizeErrors(
        await oasValidator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /info/contact/email must be a valid email address string'
    ]);
  });
});
