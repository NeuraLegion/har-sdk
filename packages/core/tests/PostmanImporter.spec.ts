import { ImporterType, PostmanImporter } from '../src';

describe('PostmanImporter', () => {
  const importer = new PostmanImporter();

  describe('type', () => {
    it(`should be equal ${ImporterType.POSTMAN}`, () =>
      expect(importer.type).toEqual(ImporterType.POSTMAN));
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
      expect(result).toBe(true);
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
      expect(result).toBe(true);
    });

    it('should refuse to support of an incompatible version', () => {
      // act
      const result = importer.isSupported({
        id: '70fa9b38-91c0-7e67-0ead-b31622bdc152',
        name: 'example',
        description: 'Description'
      });

      // assert
      expect(result).toBe(false);
    });

    it('should refuse to support of an undefined version', () => {
      // act
      const result = importer.isSupported({
        info: { schema: null as unknown as string },
        item: [],
        variable: []
      });

      // assert
      expect(result).toBe(false);
    });
  });

  describe('import', () => {
    it('should return nothing if JSON is broken', async () => {
      // act
      const result = await importer.import(
        `{ "info": { "schema": 'https://schema.getpostman.com/json/collection/v2.0.0/collection.json' },`
      );

      // assert
      expect(typeof result).toEqual('undefined');
      expect(importer.getErrorDetails('json')).not.toBeNull();
      expect(importer.getErrorDetails('yaml')).not.toBeNull();
    });

    it('should return the spec with expected type', async () => {
      // act
      const result = await importer.import(
        `{ "info": { "schema": "https://schema.getpostman.com/json/collection/v2.0.0/collection.json", "name": "example" }, "item": [], "variable": []}`
      );

      // assert
      expect(result).toEqual({
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
