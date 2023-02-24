import { ConvertError, oas2har } from '../src';
import yaml, { load } from 'js-yaml';
import { OpenAPIV2, Request } from '@har-sdk/core';
import { resolve } from 'path';
import { readFile, readFileSync } from 'fs';
import { promisify } from 'util';

describe('DefaultConverter', () => {
  describe('convert', () => {
    [
      {
        input: 'github.swagger.json',
        expected: 'github.swagger.result.json',
        message: 'should convert GitHub OAS v2 (JSON) to HAR'
      },
      {
        input: 'petstore.oas.yaml',
        expected: 'petstore.oas.result.json',
        message: 'should convert Petstore OAS v3 (YAML) to HAR'
      },
      {
        input: 'multipart.oas.yaml',
        expected: 'multipart.oas.result.json',
        message:
          'should generate multipart/form-data according to OAS definition'
      },
      {
        input: 'refs.oas.yaml',
        expected: 'refs.oas.result.json',
        message:
          'should convert OAS v3 spec even if parameters are declared via ref'
      },
      {
        input: 'servers-with-variables.oas.yaml',
        expected: 'servers-with-variables.oas.result.json',
        message: 'should substitute variables in servers'
      },
      {
        input: 'empty-schema.swagger.yaml',
        expected: 'empty-schema.swagger.result.json',
        message: 'should correctly handle empty schemas (swagger)'
      },
      {
        input: 'empty-schema.oas.yaml',
        expected: 'empty-schema.oas.result.json',
        message: 'should correctly handle empty schemas (oas)'
      },
      {
        // TODO support for `deepObject` style and `allowReserved` keyword
        input: 'params-query.oas.yaml',
        expected: 'params-query.oas.result.json',
        message: 'should correctly convert oas query parameters'
      },
      {
        input: 'params-query.swagger.yaml',
        expected: 'params-query.swagger.result.json',
        message: 'should correctly convert swagger query parameters'
      },
      {
        input: 'params-path.oas.yaml',
        expected: 'params-path.oas.result.json',
        message: 'should correctly convert oas path parameters'
      },
      {
        input: 'params-path.swagger.yaml',
        expected: 'params-path.swagger.result.json',
        message: 'should correctly convert swagger path parameters'
      },
      {
        input: 'params-header.oas.yaml',
        expected: 'params-header.oas.result.json',
        message: 'should correctly convert oas header parameters'
      },
      {
        input: 'params-header.swagger.yaml',
        expected: 'params-header.swagger.result.json',
        message: 'should correctly convert swagger header parameters'
      },
      {
        input: 'params-values-precedence.oas.json',
        expected: 'params-values-precedence.oas.result.json',
        message: 'should correctly use default values of path parameter'
      },
      {
        input: 'params-body-default.swagger.json',
        expected: 'params-body-default.swagger.result.json',
        message: 'should correctly use default value for swagger body'
      },
      {
        input: 'scheme-security.oas.yaml',
        expected: 'scheme-security.oas.result.json',
        message: 'should correctly convert security schemas'
      },
      {
        input: 'scheme-security.swagger.yaml',
        expected: 'scheme-security.swagger.result.json',
        message: 'should correctly convert security schemas'
      },
      {
        input: 'scheme-security-override.oas.yaml',
        expected: 'scheme-security-override.oas.result.json',
        message: 'should correctly override security schemas'
      },
      {
        input: 'missing-security.oas.yaml',
        expected: 'missing-security.oas.result.json',
        message: 'should correctly proceed with missing oas security schemes'
      },
      {
        input: 'missing-security.swagger.yaml',
        expected: 'missing-security.swagger.result.json',
        message:
          'should correctly proceed with missing swagger security definitions'
      },
      {
        input: 'params-body-default.oas.yaml',
        expected: 'params-body-default.oas.result.json',
        message: 'should correctly use default value for oas body'
      },
      {
        input: 'circular-refs.swagger.yaml',
        expected: 'circular-refs.swagger.result.json',
        message: 'should correctly handle circular references'
      },
      {
        input: 'params-form-data.swagger.yaml',
        expected: 'params-form-data.swagger.result.json',
        message: 'should correctly convert swagger file parameters'
      },
      {
        input: 'params-encoding.oas.yaml',
        expected: 'params-encoding.oas.result.json',
        message:
          'should correctly convert oas file with multipart and encoding parameters'
      },
      {
        input: 'xml-models.oas.yaml',
        expected: 'xml-models.oas.result.json',
        message: 'should properly serialize models to XML (oas)'
      },
      {
        input: 'xml-models.swagger.yaml',
        expected: 'xml-models.swagger.result.json',
        message: 'should properly serialize models to XML (swagger)'
      },
      {
        input: 'binary-body.swagger.yaml',
        expected: 'binary-body.swagger.result.json',
        message: 'should properly serialize binary types (swagger)'
      },
      {
        input: 'binary-body.oas.yaml',
        expected: 'binary-body.oas.result.json',
        message: 'should properly serialize binary types (oas)'
      }
    ].forEach(({ input: inputFile, expected: expectedFile, message }) => {
      it(message, async () => {
        const content = readFileSync(
          resolve(__dirname, `./fixtures/${inputFile}`),
          'utf-8'
        );
        const input = inputFile.endsWith('json')
          ? JSON.parse(content)
          : load(content);

        const expected = JSON.parse(
          readFileSync(
            resolve(__dirname, `./fixtures/${expectedFile}`),
            'utf-8'
          )
        );

        const result: Request[] = await oas2har(input as any);

        expect(result).toStrictEqual(expected);
      });
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
        input: 'convert-error-on-header-multi.swagger.yaml',
        expected: '/paths/~1headers~1{p}/get/parameters/1'
      },
      {
        input: 'convert-error-on-path.swagger.yaml',
        expected: '/paths/~1store~1order~1{orderId}/put/parameters/0'
      },
      {
        input: 'convert-error-on-path-multi.swagger.yaml',
        expected: '/paths/~1headers~1{p}/get/parameters/0'
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
          resolve(__dirname, `./fixtures/${input}`),
          'utf8'
        );

        const result = oas2har(yaml.load(content) as OpenAPIV2.Document);

        await expect(result).rejects.toThrow(ConvertError);
        await expect(result).rejects.toMatchObject({
          jsonPointer: expected
        });
      })
    );
  });
});
