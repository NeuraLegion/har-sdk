import nexploitPostman from './postman.nexploit.json';
import { PostmanValidator } from '../src';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Postman } from '@har-sdk/types';
import 'chai/register-should';

use(chaiAsPromised);

describe('PostmanValidator', () => {
  const validator = new PostmanValidator();

  it('should successfully validate valid document (Nexploit, json)', async () => {
    const result = await validator.validate(
      nexploitPostman as unknown as Postman.Document
    );
    result.should.be.empty;
  });

  it('should throw exception if cannot determine version of document', async () => {
    const apiDoc = {
      info: {
        name: 'Invalid Postman document',
        schema:
          'https://schema.getpostman.com/json/collection/v1.0.0/collection.json'
      }
    };

    return validator
      .validate(apiDoc as unknown as Postman.Document)
      .should.be.rejectedWith(
        Error,
        'Unsupported or invalid specification version'
      );
  });

  it('should return list of errors if document is invalid', async () => {
    const apiDoc = {
      info: {
        title: 'Invalid Postman document',
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      }
    };

    const result = await validator.validate(
      apiDoc as unknown as Postman.Document
    );

    result.should.deep.eq([
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
