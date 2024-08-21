import { ConvertError, oas2har } from '../src';
import { load } from 'js-yaml';
import { OpenAPIV2, Request } from '@har-sdk/core';
import { resolve } from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

describe('DefaultConverter', () => {
  const readFileAsync = promisify(readFile);

  const loadFile = async (fileName: string) => {
    const filePath = resolve(__dirname, fileName);

    const content = await readFileAsync(filePath, 'utf-8');

    return content.endsWith('.json') ? JSON.parse(content) : load(content);
  };

  const createFixture = async ({
    inputFile,
    expectedFile
  }: {
    inputFile: string;
    expectedFile: string;
  }) => ({
    inputDoc: await loadFile(inputFile),
    expectedDoc: await loadFile(expectedFile)
  });

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
        input: 'consumes-produces-missing.swagger.yaml',
        expected: 'consumes-produces-missing.swagger.result.json',
        message: 'should correctly handle missing consumes/produces (swagger)'
      },
      {
        input: 'consumes-produces-override.swagger.yaml',
        expected: 'consumes-produces-override.swagger.result.json',
        message:
          'should correctly handle override consumes/produces to empty (swagger)'
      },
      {
        input: 'consumes-produces-root.swagger.yaml',
        expected: 'consumes-produces-root.swagger.result.json',
        message:
          'should correctly handle root level only consumes/produces (swagger)'
      },
      {
        input: 'consumes-produces-operation.swagger.yaml',
        expected: 'consumes-produces-operation.swagger.result.json',
        message:
          'should correctly handle operation level only consumes/produces (swagger)'
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
      },
      {
        input: 'cookies.oas.yaml',
        expected: 'cookies.oas.result.json',
        message: 'should properly serialize cookies (oas)'
      }
    ].forEach(({ input: inputFile, expected: expectedFile, message }) => {
      it(message, async () => {
        const { inputDoc, expectedDoc } = await createFixture({
          inputFile: `./fixtures/${inputFile}`,
          expectedFile: `./fixtures/${expectedFile}`
        });

        const result: Request[] = await oas2har(inputDoc as any);

        expect(result).toStrictEqual(expectedDoc);
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
        const inputDoc = await loadFile(`./fixtures/${input}`);

        const result = oas2har(inputDoc as OpenAPIV2.Document);

        await expect(result).rejects.toThrow(ConvertError);
        await expect(result).rejects.toMatchObject({
          jsonPointer: expected
        });
      })
    );

    it('should ignore x-example when includeVendorExamples is true (oas)', async () => {
      // arrange
      const { inputDoc, expectedDoc } = await createFixture({
        inputFile: `./fixtures/x-example.oas.yaml`,
        expectedFile: `./fixtures/x-example.oas.result.json`
      });

      // act
      const result: Request[] = await oas2har(inputDoc as any, {
        includeVendorExamples: true
      });

      // assert
      expect(result).toStrictEqual(expectedDoc);
    });

    it.each(['path', 'query', 'header', 'form-data'])(
      'should ignore %s parameter vendor example when vendor examples inclusion disabled (swagger)',
      async (input) => {
        // arrange
        const { inputDoc, expectedDoc } = await createFixture({
          inputFile: `./fixtures/x-example.${input}.swagger.yaml`,
          expectedFile: `./fixtures/x-example.${input}.disabled.swagger.result.json`
        });

        // act
        const result: Request[] = await oas2har(inputDoc as any, {
          includeVendorExamples: false
        });

        // assert
        expect(result).toStrictEqual(expectedDoc);
      }
    );

    it.each(['path', 'query', 'header', 'form-data'])(
      'should use %s parameter vendor example when vendor examples inclusion enabled (swagger)',
      async (input) => {
        // arrange
        const { inputDoc, expectedDoc } = await createFixture({
          inputFile: `./fixtures/x-example.${input}.swagger.yaml`,
          expectedFile: `./fixtures/x-example.${input}.swagger.result.json`
        });

        // act
        const result: Request[] = await oas2har(inputDoc as any, {
          includeVendorExamples: true
        });

        // assert
        expect(result).toStrictEqual(expectedDoc);
      }
    );

    it.each(['schemathesis', 'redocly', 'api-connect', 'smartbear'])(
      'should ignore body parameter vendor example when vendor examples inclusion disabled (swagger, %s)',
      async (input) => {
        // arrange
        const { inputDoc, expectedDoc } = await createFixture({
          inputFile: `./fixtures/x-example.body.${input}.swagger.yaml`,
          expectedFile: `./fixtures/x-example.body.disabled.swagger.result.json`
        });

        // act
        const result: Request[] = await oas2har(inputDoc as any, {
          includeVendorExamples: false
        });

        // assert
        expect(result).toStrictEqual(expectedDoc);
      }
    );

    it.each(['schemathesis', 'redocly', 'api-connect', 'smartbear'])(
      'should use body parameter vendor example when vendor examples inclusion enabled (swagger, %s)',
      async (input) => {
        // arrange
        const { inputDoc, expectedDoc } = await createFixture({
          inputFile: `./fixtures/x-example.body.${input}.swagger.yaml`,
          expectedFile: `./fixtures/x-example.body.${input}.swagger.result.json`
        });

        // act
        const result: Request[] = await oas2har(inputDoc as any, {
          includeVendorExamples: true
        });

        // assert
        expect(result).toStrictEqual(expectedDoc);
      }
    );

    it('should ignore properties other than http method', async () => {
      // arrange
      const { inputDoc, expectedDoc } = await createFixture({
        inputFile: `./fixtures/path-item.ignore-non-http-method-properties.oas.yaml`,
        expectedFile: `./fixtures/path-item.ignore-non-http-method-properties.oas.result.json`
      });

      // act
      const result: Request[] = await oas2har(inputDoc as any);

      // assert
      expect(result).toStrictEqual(expectedDoc);
    });

    it('should correctly resolve path-item parameters', async () => {
      // arrange
      const { inputDoc, expectedDoc } = await createFixture({
        inputFile: `./fixtures/path-item.params.resolution.oas.yaml`,
        expectedFile: `./fixtures/path-item.params.resolution.oas.result.json`
      });

      // act
      const result: Request[] = await oas2har(inputDoc as any);

      // assert
      expect(result).toStrictEqual(expectedDoc);
    });
  });
});
