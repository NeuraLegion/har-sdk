import githubSwagger from './fixtures/github.swagger.json';
import { ConvertError, oas2har } from '../src';
import yaml from 'js-yaml';
import { OpenAPIV2, OpenAPIV3, Request } from '@har-sdk/core';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import 'chai/register-should';

use(chaiAsPromised);

describe('DefaultConverter', () => {
  describe('convert', () => {
    it('should convert GitHub OAS v2 (JSON) to HAR', async () => {
      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/github.swagger.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        githubSwagger as unknown as OpenAPIV2.Document
      );

      result.should.deep.eq(expected);
    });

    it('should convert Petstore OAS v3 (YAML) to HAR', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/petstore.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/petstore.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });

    it('should generate multipart/form-data according to OAS definition', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/multipart.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/multipart.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });

    it('should convert OAS v3 spec even if parameters are declared via ref', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/refs.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/refs.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });

    it('should substitute variables in servers', async () => {
      const content: string = await promisify(readFile)(
        resolve('./tests/fixtures/servers-with-variables.oas.yaml'),
        'utf8'
      );

      const expected = JSON.parse(
        await promisify(readFile)(
          resolve('./tests/fixtures/servers-with-variables.oas.result.json'),
          'utf-8'
        )
      );

      const result: Request[] = await oas2har(
        yaml.load(content) as OpenAPIV3.Document
      );

      result.should.deep.eq(expected);
    });

    [
      {
        input: 'convert-error-on-url.oas.yaml',
        expected: '/servers/0'
      },
      {
        input: 'convert-error-on-url.swagger.yaml',
        expected: '/schemes/0'
      },
      {
        input: 'convert-error-on-servers.oas.yaml',
        expected: '/servers'
      },
      {
        input: 'convert-error-on-variable.oas.yaml',
        expected: '/servers/0/variables/port'
      },
      {
        input: 'convert-error-on-host.swagger.yaml',
        expected: '/host'
      },
      {
        input: 'convert-error-on-body.swagger.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/3/schema'
      },
      {
        input: 'convert-error-on-header.swagger.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/2'
      },
      {
        input: 'convert-error-on-path.swagger.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/0'
      },
      {
        input: 'convert-error-on-query.swagger.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/1'
      },
      {
        input: 'convert-error-on-body.oas.yaml',
        expected:
          '/paths/~1store~1order~1{orderId}/put/requestBody/content/application~1json/schema'
      },
      {
        input: 'convert-error-on-header.oas.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/2/schema'
      },
      {
        input: 'convert-error-on-path.oas.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/0/schema'
      },
      {
        input: 'convert-error-on-query.oas.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/1/schema'
      }
    ].forEach(({ input, expected }) =>
      it(`should throw an convert error on ${input.replace(
        /^convert-error-on-(.+)\.(.+)\.yaml$/,
        '$1 ($2)'
      )}`, async () => {
        const content: string = await promisify(readFile)(
          resolve(`./tests/fixtures/${input}`),
          'utf8'
        );

        const result = oas2har(yaml.load(content) as OpenAPIV2.Document);

        return result.should.be
          .rejectedWith(ConvertError)
          .and.eventually.have.property('jsonPointer', expected);
      })
    );
  });
});
