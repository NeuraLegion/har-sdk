import 'chai/register-should';
import { ImporterType, PostmanImporter } from '../src';

describe('PostmanImporter', () => {
  const importer = new PostmanImporter();

  describe('type', () => {
    it(`should be equal ${ImporterType.POSTMAN}`, () =>
      importer.type.should.eq(ImporterType.POSTMAN));
  });

  describe('isSupported', () => {
    it('should support Postman collection v2.1.0', () => {
      // act
      const result = importer.isSupported({
        info: {
          schema:
            'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: [],
        variable: []
      });

      // assert
      result.should.be.true;
    });

    it('should support Postman collection v2.0.0', () => {
      // act
      const result = importer.isSupported({
        info: {
          schema:
            'https://schema.getpostman.com/json/collection/v2.0.0/collection.json'
        },
        item: [],
        variable: []
      });

      // assert
      result.should.be.true;
    });

    it('should refuse to support of an incompatible version', () => {
      // act
      const result = importer.isSupported({
        id: '70fa9b38-91c0-7e67-0ead-b31622bdc152',
        name: 'example',
        description: 'Description'
      });

      // assert
      result.should.be.false;
    });

    it('should refuse to support of an undefined version', () => {
      // act
      const result = importer.isSupported({
        info: { schema: null as unknown as string },
        item: [],
        variable: []
      });

      // assert
      result.should.be.false;
    });
  });

  describe('importSpec', () => {
    it('should return nothing if JSON is broken', async () => {
      // act
      const result = await importer.importSpec(
        `{ "info": { "schema": 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json' },`
      );

      // assert
      (typeof result).should.eq('undefined');
    });

    it('should return the spec with expected type', async () => {
      // act
      const result = await importer.importSpec(
        `{ "info": { "schema": "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", "name": "example" }, "item": [], "variable": []}`
      );

      // assert
      result.should.deep.eq({
        type: ImporterType.POSTMAN,
        name: 'example.json',
        format: 'json',
        doc: {
          info: {
            schema:
              'https://schema.getpostman.com/json/collection/v2.0.0/collection.json',
            name: 'example'
          },
          item: [],
          variable: []
        }
      });
    });
  });
});
