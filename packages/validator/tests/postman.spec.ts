import nexploitPostman from './fixtures/postman.nexploit.json';
import { PostmanValidator } from '../src';
import { ErrorObject } from 'ajv';
import { Postman } from '@har-sdk/core';

describe('PostmanValidator', () => {
  const validator = new PostmanValidator();

  describe('verify', () => {
    it('should successfully validate valid document (Nexploit, json)', async () => {
      const input: Postman.Document =
        nexploitPostman as unknown as Postman.Document;

      const result = await validator.verify(input);

      expect(Object.keys(result)).toHaveLength(0);
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

      await expect(result).rejects.toThrowError(Error);
      await expect(result).rejects.toMatchObject({
        message: 'Unsupported or invalid specification version'
      });
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

      expect(result).toEqual(expected);
    });

    it('should return list of errors if no items', async () => {
      const input: Postman.Document = {
        info: {
          name: 'Postman document',
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: []
      } as unknown as Postman.Document;

      const expected: ErrorObject[] = [
        {
          instancePath: '/item',
          schemaPath: '#/properties/item/minItems',
          keyword: 'minItems',
          params: {
            limit: 1
          },
          message: 'must NOT have fewer than 1 items'
        }
      ];

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });

    it('should return a list of errors if no items in item-group', async () => {
      const input: Postman.Document = {
        info: {
          name: 'Postman document',
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [
          {
            name: 'Folder',
            item: []
          }
        ]
      } as unknown as Postman.Document;

      const expected: ErrorObject[] = [
        {
          instancePath: '/item/0/item',
          schemaPath: '#/properties/item/minItems',
          keyword: 'minItems',
          params: {
            limit: 1
          },
          message: 'must NOT have fewer than 1 items'
        }
      ];

      const result = await validator.verify(input);

      expect(result).toEqual(expected);
    });
  });
});
