import 'chai/register-should';
import { postman2har } from '../src';
import collection from './fixtures/Salesforce APIs.postman_collection.json';
import collectionWithoutVariables from './fixtures/no-such-variables.postman_collection.json';
import { ConvertError } from '../src/parser';
import { Postman, Request } from '@har-sdk/core';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

use(chaiAsPromised);

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

      result.should.be.empty;
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

      firstRequest.method.should.equal('POST');
      firstRequest.url.should.equal(
        'https://example.com/services/data/v53.0/async-queries'
      );
      firstRequest.httpVersion.should.equal('HTTP/1.1');
    });

    it('should convert Postman v2.1.0 collection to HAR (dryRun)', async () => {
      const expected = JSON.parse(
        await promisify(readFile)(
          resolve(
            './tests/fixtures/Salesforce APIs.postman_collection.result.json'
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

      JSON.parse(JSON.stringify(result)).should.deep.eq(expected);
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

          return result.should.be
            .rejectedWith(ConvertError)
            .and.eventually.have.property('jsonPointer', expected);
        })
    );
  });
});
