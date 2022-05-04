import { postman2har } from '../src';
import collection from './fixtures/Salesforce APIs.postman_collection.json';
import collectionWithoutVariables from './fixtures/no-such-variables.postman_collection.json';
import { ConvertError } from '../src/parser';
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

      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should convert Postman v2.1.0 collection to HAR', async () => {
      const [firstRequest]: Request[] = await postman2har(
        collection as unknown as Postman.Document,
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

    it('should convert Postman v2.1.0 collection to HAR (dryRun)', async () => {
      const expected = JSON.parse(
        await promisify(readFile)(
          resolve(
            __dirname,
            './fixtures/Salesforce APIs.postman_collection.result.json'
          ),
          'utf-8'
        )
      );

      const result: Request[] = await postman2har(
        collection as unknown as Postman.Document,
        {
          environment: {
            _endpoint: 'example.com'
          },
          dryRun: true
        }
      );

      expect(JSON.parse(JSON.stringify(result))).toEqual(expected);
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
              JSON.stringify(collectionWithoutVariables)
            ) as unknown as Postman.Document,
            { environment: input }
          );
          await expect(result).rejects.toBeInstanceOf(ConvertError);
          await expect(result).rejects.toMatchObject({
            jsonPointer: expected
          });
        })
    );
  });
});
