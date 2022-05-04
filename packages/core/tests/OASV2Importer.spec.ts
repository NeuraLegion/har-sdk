import { ImporterType, OASV2Importer } from '../src';

describe('OASV2Importer', () => {
  const importer = new OASV2Importer();

  describe('type', () => {
    it(`should be equal ${ImporterType.OASV2}`, () =>
      expect(importer.type).toEqual(ImporterType.OASV2));
  });

  describe('isSupported', () => {
    it('should support Swagger v2.0', () => {
      // act
      const result = importer.isSupported({
        swagger: '2.0',
        info: { version: 'v1', title: 'example' },
        paths: {}
      });

      // assert
      expect(result).toBe(true);
    });

    it('should refuse to support of an incompatible version', () => {
      // act
      const result = importer.isSupported({
        openapi: '3.0.0',
        info: { version: 'v1', title: 'example' },
        paths: {}
      });

      // assert
      expect(result).toBe(false);
    });

    it('should refuse to support of an undefined version', () => {
      // act
      const result = importer.isSupported({
        swagger: '',
        info: { version: 'v1', title: 'example' },
        paths: {}
      });

      // assert
      expect(result).toBe(false);
    });
  });

  describe('import', () => {
    it('should return nothing if JSON file is broken', async () => {
      // act
      const result = await importer.import(
        `{"swagger": "2.0","info": {"title": "Example",`
      );

      // assert
      expect(typeof result).toEqual('undefined');
      expect(importer.getErrorDetails('json')).not.toBeNull();
      expect(importer.getErrorDetails('yaml')).not.toBeNull();
    });

    it('should return the spec with expected type', async () => {
      // act
      const result = await importer.import(
        `{ "swagger": "2.0", "info": { "version": "v1", "title": "example" }, "host": "example.com","paths": {}}`
      );

      // assert
      expect(result).toEqual({
        type: ImporterType.OASV2,
        name: 'example v1.json',
        format: 'json',
        doc: {
          swagger: '2.0',
          info: { version: 'v1', title: 'example' },
          host: 'example.com',
          paths: {}
        }
      });
    });
  });
});
