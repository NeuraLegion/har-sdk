import 'chai/register-should';
import validJson from './fixtures/har.valid.json';
import missedCookieName from './fixtures/har.missed-cookie-name.json';
import wrongMethodValueHar from './fixtures/har.wrong-method-value.json';
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
