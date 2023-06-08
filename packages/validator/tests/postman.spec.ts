import nexploitPostman from './fixtures/postman.nexploit.json';
import { PostmanValidator } from '../src';
import { ErrorObject } from 'ajv';
import { Postman } from '@har-sdk/core';

describe('PostmanValidator', () => {
  const validator = new PostmanValidator();

  const getBasePostmanDoc = (): Postman.Document => ({
    info: {
      name: 'Base Postman document',
      schema:
        'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
      version: {
        major: 1,
        minor: 0,
        patch: 0
      }
    },
    item: [
      {
        request: {
          url: 'https://example.com'
        }
      }
    ],
    variable: []
  });

  describe('verify', () => {
    it('should successfully validate valid document (Nexploit, json)', async () => {
      const input: Postman.Document =
        nexploitPostman as unknown as Postman.Document;

      const result = await validator.verify(input);

      expect(result).toEqual([]);
    });

    it('should successfully validate formdata file type parameter', async () => {
      const document: Postman.Document = {
        ...getBasePostmanDoc(),
        item: [
          {
            name: 'Request',
            request: {
              method: 'POST',
              body: {
                formdata: [
                  {
                    key: 'key',
                    src: 'src',
                    type: 'file'
                  }
                ]
              }
            }
          }
        ]
      } as unknown as Postman.Document;

      const result = await validator.verify(document);

      expect(result).toEqual([]);
    });

    it.each(['text', 'default', 'some'])(
      'should successfully validate formdata %s type parameter',
      async (input) => {
        const document: Postman.Document = {
          ...getBasePostmanDoc(),
          item: [
            {
              name: 'Request',
              request: {
                method: 'POST',
                body: {
                  formdata: [
                    {
                      key: 'key',
                      value: 'value',
                      type: input
                    }
                  ]
                }
              }
            }
          ]
        } as unknown as Postman.Document;

        const result = await validator.verify(document);

        expect(result).toEqual([]);
      }
    );

    it('should fail formdata file type parameter validation when it configured incorrectly', async () => {
      const document: Postman.Document = {
        ...getBasePostmanDoc(),
        item: [
          {
            name: 'Request',
            request: {
              method: 'POST',
              body: {
                formdata: [
                  {
                    key: 'key',
                    src: {},
                    type: 'file'
                  }
                ]
              }
            }
          }
        ]
      } as unknown as Postman.Document;

      const result = await validator.verify(document);

      expect(result).toContainEqual({
        instancePath: '/item/0/request/body/formdata/0/src',
        keyword: 'type',
        message: 'must be array,string,null',
        params: {
          type: ['array', 'string', 'null']
        },
        schemaPath:
          '#/else/properties/body/else/properties/formdata/items/anyOf/1/properties/src/type'
      });
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

      await expect(result).rejects.toThrowError(
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
