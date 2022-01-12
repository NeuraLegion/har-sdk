import { postman2har } from '../src';
import postmanCollection from './fixtures/Salesforce APIs.postman_collection.json';
import { Postman, Request } from '@har-sdk/core';
import { readFile } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import 'chai/register-should';

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
        postmanCollection as unknown as Postman.Document,
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
        postmanCollection as unknown as Postman.Document,
        {
          environment: {
            _endpoint: 'example.com'
          },
          dryRun: true
        }
      );

      JSON.parse(JSON.stringify(result)).should.deep.eq(expected);
    });
  });
});
