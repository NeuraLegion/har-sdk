import { ConvertError, postman2har } from '../src';
import { Postman, Request } from '@har-sdk/core';
import { readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

describe('DefaultConverter', () => {
  describe('convert', () => {
    it('should convert empty Postman collection to HAR', async () => {
      const result: Request[] = await postman2har({
        info: {
          name: 'Postman document',
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: []
      } as Postman.Document);

      expect(result).toEqual([]);
    });

    it.each([
      {
        inputPath: './fixtures/v2.0.0-auth.postman_collection.json',
        expectedPath: './fixtures/v2.0.0-auth.postman_collection.result.json',
        label: 'v2.0.0 auth'
      },
      {
        inputPath: './fixtures/trailing-slash.postman_collection.json',
        expectedPath:
          './fixtures/trailing-slash.postman_collection.result.json',
        label: 'preserving the trailing slash when it is specified explicitly'
      },
      {
        inputPath: './fixtures/misused-variable.postman_collection.json',
        expectedPath:
          './fixtures/misused-variable.postman_collection.result.json',
        label: 'when the variable is misused in the URL'
      }
    ])(
      'should convert Postman collection $label',
      async ({ inputPath, expectedPath }) => {
        const expected = JSON.parse(
          await promisify(readFile)(resolve(__dirname, expectedPath), 'utf-8')
        );

        const result: Request[] = await postman2har(
          (await import(inputPath)) as Postman.Document
        );

        expect(result).toEqual(expected);
      }
    );

    it('should convert Postman v2.1.0 collection to HAR', async () => {
      const [firstRequest]: Request[] = await postman2har(
        (await import(
          './fixtures/salesforce-apis.postman_collection.json'
        )) as Postman.Document,
        {
          environment: {
            _endpoint: 'example.com'
          }
        }
      );

      expect(firstRequest.method).toEqual('POST');
      expect(firstRequest.url).toEqual(
        'https://example.com/services/data/v53.0/async-queries'
      );
      expect(firstRequest.httpVersion).toEqual('HTTP/1.1');
    });

    it('should convert Postman collection when the dry-run mode is enabled', async () => {
      const expected = JSON.parse(
        await promisify(readFile)(
          resolve(
            __dirname,
            './fixtures/salesforce-apis.postman_collection.result.json'
          ),
          'utf-8'
        )
      );

      const result: Request[] = await postman2har(
        (await import(
          './fixtures/salesforce-apis.postman_collection.json'
        )) as Postman.Document,
        {
          environment: {
            _endpoint: 'example.com'
          },
          dryRun: true
        }
      );

      expect(result).toEqual(expected);
    });

    [
      {
        expected: '/item/0/request/header/0/value',
        input: {
          baseUrl: 'http://example.com',
          apiVersion: 'v59',
          apiPrefix: 'api',
          propName: 'haltOnError',
          userId: '1'
        }
      },
      {
        expected: '/item/0/request/url/host/0',
        input: {
          apiVersion: 'v59',
          contentType: 'application/json',
          apiPrefix: 'api',
          propName: 'haltOnError',
          userId: '1'
        }
      },
      {
        expected: '/item/0/request/url',
        input: {
          baseUrl: 'kk    k://',
          contentType: 'application/json',
          apiVersion: 'v59',
          apiPrefix: 'api',
          propName: 'haltOnError',
          userId: '1'
        }
      },
      {
        expected: '/item/0/request/url/path/1',
        input: {
          baseUrl: 'http://example.com',
          contentType: 'application/json',
          apiPrefix: 'api',
          propName: 'haltOnError',
          userId: '1'
        }
      },
      {
        expected: '/item/0/request/url/path/0',
        input: {
          baseUrl: 'http://example.com',
          apiVersion: 'v59',
          contentType: 'application/json',
          propName: 'haltOnError',
          userId: '1'
        }
      },
      {
        expected: '/item/0/request/body/raw',
        input: {
          baseUrl: 'http://example.com',
          apiVersion: 'v59',
          contentType: 'application/json',
          apiPrefix: 'api',
          userId: '1'
        }
      },
      {
        expected: '/item/0/request/url/query/0/value',
        input: {
          baseUrl: 'http://example.com',
          apiVersion: 'v59',
          contentType: 'application/json',
          apiPrefix: 'api',
          propName: 'haltOnError'
        }
      }
    ].forEach(
      ({
        expected,
        input
      }: {
        input: Record<string, string>;
        expected: string;
      }) =>
        it(`should throw an error while resolving variables in ${expected}`, async () => {
          const result = postman2har(
            JSON.parse(
              JSON.stringify(
                await import(
                  './fixtures/no-such-variables.postman_collection.json'
                )
              )
            ) as unknown as Postman.Document,
            { environment: input }
          );
          await expect(result).rejects.toThrow(ConvertError);
          await expect(result).rejects.toMatchObject({
            jsonPointer: expected
          });
        })
    );
  });
});
