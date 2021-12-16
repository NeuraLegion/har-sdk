import 'chai/register-should';
import validJson from './fixtures/har.valid.json';
import missedCookieName from './fixtures/har.missed-cookie-name.json';
import missedHeadersSize from './fixtures/har.missed-headers-size.json';
import missedServerIP from './fixtures/har.missed-server-ip.json';
import invalidServerIP from './fixtures/har.invalid-server-ip.json';
import wrongMethodValueHar from './fixtures/har.wrong-method-value.json';
import negativeBodySize from './fixtures/har.negative-body-size.json';
import invalidExpiresInCookie from './fixtures/har.invalid-expires-in-cookie.json';
import nullableCacheRequest from './fixtures/har.nullable-cache-request.json';
import { HarValidator } from '../src';
import { ErrorObject } from 'ajv';
import { Har } from '@har-sdk/types';

describe('HarValidator', () => {
  const validator = new HarValidator();

  describe('verify', () => {
    it('should successfully validate valid HAR', async () => {
      // arrange
      const input = validJson as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      result.should.be.empty;
    });

    it('should successfully validate HAR if server IP is missed', async () => {
      // arrange
      const input = missedServerIP as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      result.should.be.empty;
    });

    it('should return error if server IP is not valid IP address', async () => {
      // arrange
      const input = invalidServerIP as unknown as Har;
      const expected: ErrorObject[] = [
        {
          instancePath: '/log/entries/0/serverIPAddress',
          schemaPath: '#/properties/serverIPAddress/errorMessage',
          keyword: 'errorMessage',
          params: {
            errors: [
              {
                emUsed: true,
                instancePath: '/log/entries/0/serverIPAddress',
                schemaPath: '#/properties/serverIPAddress/else/then/format',
                keyword: 'format',
                params: { format: 'ipv4' },
                message: 'must match format "ipv4"'
              },
              {
                emUsed: true,
                instancePath: '/log/entries/0/serverIPAddress',
                schemaPath: '#/properties/serverIPAddress/else/if',
                keyword: 'if',
                params: { failingKeyword: 'then' },
                message: 'must match "then" schema'
              },
              {
                emUsed: true,
                instancePath: '/log/entries/0/serverIPAddress',
                schemaPath: '#/properties/serverIPAddress/if',
                keyword: 'if',
                params: { failingKeyword: 'else' },
                message: 'must match "else" schema'
              }
            ]
          },
          message:
            'The property `serverIPAddress` must have a value that is either IPv4 or IPv6 format'
        }
      ];

      // act
      const result = await validator.verify(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should return error if entries are empty', async () => {
      // arrange
      const input = {
        log: {
          version: '1.2',
          creator: {
            name: 'test',
            version: '0.0.0'
          },
          entries: []
        }
      } as Har;
      const expected: ErrorObject[] = [
        {
          instancePath: '/log/entries',
          keyword: 'minItems',
          message: 'must NOT have fewer than 1 items',
          params: {
            limit: 1
          },
          schemaPath: '#/properties/entries/minItems'
        }
      ];

      // act
      const result = await validator.verify(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should return error if cookie name is missed', async () => {
      // arrange
      const input = missedCookieName as Har;
      const expected: ErrorObject[] = [
        {
          instancePath: '/log/entries/0/request/cookies/0',
          keyword: 'required',
          message: "must have required property 'name'",
          params: {
            missingProperty: 'name'
          },
          schemaPath: '#/definitions/cookie/required'
        }
      ];

      // act
      const result = await validator.verify(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should successfully validate HAR if "headersSize" is missed', async () => {
      // arrange
      const input = missedHeadersSize as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      result.should.be.empty;
    });

    it('should successfully validate HAR even if "expires" is not date-time string', async () => {
      // arrange
      const input = invalidExpiresInCookie as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      result.should.be.empty;
    });

    it('should successfully validate HAR if "beforeRequest" or/and "afterRequest" are null', async () => {
      // arrange
      const input = nullableCacheRequest as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      result.should.be.empty;
    });

    it('should successfully validate HAR if "bodySize" is less than -1', async () => {
      // arrange
      const input = negativeBodySize as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      result.should.be.empty;
    });

    it('should return error if method accepts wrong value', async () => {
      // arrange
      const input = wrongMethodValueHar as Har;
      const expected: ErrorObject[] = [
        {
          instancePath: '/log/entries/0/request/method',
          keyword: 'enum',
          message: 'must be equal to one of the allowed values',
          params: {
            allowedValues: [
              'GET',
              'PUT',
              'POST',
              'PATCH',
              'DELETE',
              'COPY',
              'HEAD',
              'OPTIONS',
              'LINK',
              'UNLINK',
              'PURGE',
              'LOCK',
              'UNLOCK',
              'PROPFIND',
              'VIEW'
            ]
          },
          schemaPath: '#/properties/method/enum'
        }
      ];

      // act
      const result = await validator.verify(input);

      // assert
      result.should.deep.eq(expected);
    });
  });
});
