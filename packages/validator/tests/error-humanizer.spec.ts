import { ErrorHumanizer } from '../src/humanizer';
import { OASValidator } from '../src';
import { OpenAPIV2 } from '@har-sdk/types';
import 'chai/register-should';

describe('ErrorHumanizer', () => {
  const validator = new OASValidator();
  const humanizer = new ErrorHumanizer();

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
        await validator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      "the root value is missing the required field 'host'"
    ]);
  });

  it('should return original "errorMessage" for path regex error', async () => {
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
        await validator.validate(apiDoc as unknown as OpenAPIV2.Document)
      )
      .map((error) => error.message);

    result.should.deep.eq([
      'the value at /paths should only have path names that start with `/`'
    ]);
  });
});
