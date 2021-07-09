import nexplotPostman from './nexploit.postman.json';
import { PostmanValidator } from '../src';
import { Postman } from '@har-sdk/types';
import 'chai/register-should';

describe('PostmanValidator', () => {
  const validator = new PostmanValidator();

  describe('verify', () => {
    it('should successfully validate postman document', async () => {
      const result = await validator.verify(
        nexplotPostman as unknown as Postman.Document
      );
      result.errors.should.be.empty;
    });

    it('should throw error if cannot determine version of document', async () => {
      const apiDoc = {
        info: {
          name: 'Some valid API document',
          schema:
            'https://schema.getpostman.com/json/collection/v1.0.0/collection.json'
        },
        paths: {}
      };

      try {
        await validator.verify(apiDoc as unknown as Postman.Document);
      } catch (err) {
        err.message.should.be.equal(
          'Cannot determine version of schema. Schema ID is missed.'
        );
      }
    });

    it('should throw error if document is invalid', async () => {
      const apiDoc = {
        info: {
          title: 'Some valid API document',
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        }
      };
      const errors = [
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

      const result = await validator.verify(
        apiDoc as unknown as Postman.Document
      );
      result.errors.should.deep.eq(errors);
    });
  });
});
