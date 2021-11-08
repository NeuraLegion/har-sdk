import nexploitPostman from './postman.nexploit.json';
import { PostmanValidator } from '../src';
import { ErrorObject } from 'ajv';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Postman } from '@har-sdk/types';
import 'chai/register-should';

use(chaiAsPromised);

describe('PostmanValidator', () => {
  const validator = new PostmanValidator();

  describe('verify', () => {
    it('should successfully validate valid document (Nexploit, json)', async () => {
      const input: Postman.Document =
        nexploitPostman as unknown as Postman.Document;

      const result = await validator.verify(input);

      result.should.be.empty;
    });

    it('should throw exception if cannot determine version of document', async () => {
      const input: Postman.Document = {
        info: {
          name: 'Invalid Postman document',
          schema:
            'https://schema.getpostman.com/json/collection/v1.0.0/collection.json'
        }
      } as unknown as Postman.Document;

      const result = validator.verify(input);

      return result.should.be.rejectedWith(
        Error,
        'Unsupported or invalid specification version'
      );
    });

    it('should return list of errors if document is invalid', async () => {
      const input: Postman.Document = {
        info: {
          title: 'Invalid Postman document',
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        }
      } as unknown as Postman.Document;

      const expected: ErrorObject[] = [
        {
          instancePath: '',
          schemaPath: '#/required',
          keyword: 'required',
          params: {
            missingProperty: 'item'
          },
          message: "must have required property 'item'"
        },
        {
          instancePath: '/info',
          keyword: 'required',
          message: "must have required property 'name'",
          params: {
            missingProperty: 'name'
          },
          schemaPath: '#/required'
        }
      ];

      const result = await validator.verify(input);

      result.should.deep.eq(expected);
    });
  });
});
