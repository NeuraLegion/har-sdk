import nexplotPostman from './postman.nexploit.json';
import { PostmanValidator } from '../src';
import { Postman } from '@har-sdk/types';
import 'chai/register-should';

describe('PostmanValidator', () => {
  const validator = new PostmanValidator();

  it('should successfully validate valid document (Nexploit, json)', async () => {
    const result = await validator.verify(
      nexplotPostman as unknown as Postman.Document
    );
    result.errors.should.be.empty;
  });

  it('should throw exception if cannot determine version of document', async () => {
    const apiDoc = {
      info: {
        name: 'Invalid Postman document',
        schema:
          'https://schema.getpostman.com/json/collection/v1.0.0/collection.json'
      }
    };

    try {
      await validator.verify(apiDoc as unknown as Postman.Document);
    } catch (err) {
      (err as Error).message.should.be.equal(
        'Cannot determine version of schema. Schema ID is missed.'
      );
    }
  });

  it('should return list of errors if document is invalid', async () => {
    const apiDoc = {
      info: {
        title: 'Invalid Postman document',
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      }
    };

    const result = await validator.verify(
      apiDoc as unknown as Postman.Document
    );

    result.errors.should.deep.eq([
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
    ]);
  });
});
