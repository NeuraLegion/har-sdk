import nexplotPostman from './NexPloit_api.postman.json';
import { PostmanValidator } from '../src';
import { Postman } from '@har-sdk/types';
import { expect } from 'chai';

describe('PostmanValidator', async () => {
  const validator = new PostmanValidator();

  describe('verify', async () => {
    it('Valid JSON', async () => {
      const result = await validator.verify(
        nexplotPostman as unknown as Postman.Document
      );
      expect(result.errors.length).to.be.equal(0);
    });

    it('Invalid JSON: cannot determine version of document', async () => {
      const apiDoc = {
        info: {
          title: 'Some valid API document',
          version: '1.0.0'
        },
        paths: {}
      };

      try {
        await validator.verify(apiDoc as unknown as Postman.Document);
      } catch (err) {
        expect(err.message).to.be.equal(
          'Cannot determine version of schema. Schema ID is missed.'
        );
      }
    });

    it('Invalid JSON: invalid document', async () => {
      const apiDoc = {
        info: {
          title: 'Some valid API document',
          schema: 'https://schema.getpostman.com/json/collection/v2.0.0/#',
          version: '2.0.0'
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
      expect(result.errors).to.deep.equal(errors);
    });
  });
});
