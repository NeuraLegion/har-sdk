import validJson from './fixtures/har.valid.json';
import missedCookieName from './fixtures/har.missed-cookie-name.json';
import missedServerIP from './fixtures/har.missed-server-ip.json';
import invalidServerIP from './fixtures/har.invalid-server-ip.json';
import wrongMethodValueHar from './fixtures/har.wrong-method-value.json';
import harGh75 from './fixtures/har.gh-75.json';
import { HarValidator } from '../src';
import { ErrorObject } from 'ajv';
import { Har } from '@har-sdk/core';

describe('HarValidator', () => {
  const validator = new HarValidator();

  describe('verify', () => {
    it('should successfully validate valid HAR', async () => {
      // arrange
      const input = validJson as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should successfully validate HAR if server IP is missed', async () => {
      // arrange
      const input = missedServerIP as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      expect(Object.keys(result)).toHaveLength(0);
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
                instancePath: '/log/entries/0/serverIPAddress',
                schemaPath:
                  '#/properties/serverIPAddress/else/else/then/format',
                keyword: 'format',
                params: {
                  format: 'ipv4'
                },
                message: 'must match format "ipv4"',
                emUsed: true
              },
              {
                instancePath: '/log/entries/0/serverIPAddress',
                schemaPath: '#/properties/serverIPAddress/else/else/if',
                keyword: 'if',
                params: {
                  failingKeyword: 'then'
                },
                message: 'must match "then" schema',
                emUsed: true
              },
              {
                instancePath: '/log/entries/0/serverIPAddress',
                schemaPath: '#/properties/serverIPAddress/else/if',
                keyword: 'if',
                params: {
                  failingKeyword: 'else'
                },
                message: 'must match "else" schema',
                emUsed: true
              },
              {
                instancePath: '/log/entries/0/serverIPAddress',
                schemaPath: '#/properties/serverIPAddress/if',
                keyword: 'if',
                params: {
                  failingKeyword: 'else'
                },
                message: 'must match "else" schema',
                emUsed: true
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
      expect(result).toEqual(expected);
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
      expect(result).toEqual(expected);
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
      expect(result).toEqual(expected);
    });

    it('should successfully validate HAR from GitHub issue: #75', async () => {
      // arrange
      const input = harGh75 as unknown as Har;

      // act
      const result = await validator.verify(input);

      // assert
      expect(Object.keys(result)).toHaveLength(0);
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
      expect(result).toEqual(expected);
    });
  });
});
