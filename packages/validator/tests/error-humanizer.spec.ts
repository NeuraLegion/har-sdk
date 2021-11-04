import { ErrorHumanizer } from '../src/humanizer';
import { OASValidator, PostmanValidator } from '../src';
import { OpenAPIV2, Postman } from '@har-sdk/types';
import 'chai/register-should';

describe('ErrorHumanizer', () => {
  const oasValidator = new OASValidator();
  const postmanValidator = new PostmanValidator();
  const humanizer = new ErrorHumanizer();

  it('should return original "errorMessage" if exists', async () => {
    const apiDoc = {
      swagger: '2.0',
      host: 'localhost',
      info: {
        title: 'Invalid OpenAPI document',
        version: '1.0.0'
      },
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
    const apiDoc = {
      swagger: '2.0',
      info: {
        title: 'Invalid OpenAPI document',
        version: '1.0.0'
      },
      paths: {}
    };

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
      swagger: '2.0',
      host: 'localhost',
      info: {
        title: 'Invalid OpenAPI document',
        version: '1.0.0'
      },
      schemes: ['https', 'file'],
      paths: {}
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
      swagger: '2.0',
      host: 'localhost',
      info: 42,
      paths: {}
    };

    const result = humanizer
      .humanizeErrors(
        await oasValidator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq(['the value at /info must be an object']);
  });

  it('should humanize "maxLength" error message', async () => {
    const apiDoc = {
      info: {
        name: 'Invalid Postman document',
        schema:
          'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
        version: {
          major: 2021,
          minor: 11,
          patch: 4,
          identifier: 'id0123456789'
        }
      },
      item: [] as any
    };

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
    const apiDoc = {
      info: {
        name: 'Invalid Postman document',
        schema:
          'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
        version: {
          major: -1,
          minor: 11,
          patch: 4
        }
      },
      item: [] as any
    };

    const result = humanizer
      .humanizeErrors(
        await postmanValidator.validate(apiDoc as unknown as Postman.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /info/version/major must be equal to or greater than 0'
    ]);
  });

  it('should humanize "pattern" error message', async () => {
    const apiDoc = {
      swagger: '2.0',
      host: '{test}',
      info: {
        title: 'Invalid OpenAPI document',
        version: '1.0.0'
      },
      paths: {}
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
    const apiDoc = {
      swagger: '2.0',
      host: 'localhost',
      info: {
        title: 'Invalid OpenAPI document',
        version: '1.0.0',
        contact: {
          email: 'dummy'
        }
      },
      paths: {}
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
