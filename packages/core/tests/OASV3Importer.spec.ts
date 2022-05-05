import { ImporterType, OASV3Importer } from '../src';

describe('OASV3Importer', () => {
  const importer = new OASV3Importer();

  describe('type', () => {
    it(`should be equal ${ImporterType.OASV3}`, () =>
      expect(importer.type).toEqual(ImporterType.OASV3));
  });

  describe('isSupported', () => {
    it('should refuse to support of an incompatible version', () => {
      // act
      const result = importer.isSupported({
        openapi: '2.0.0',
        info: { version: 'v1', title: 'example' },
        paths: {}
      });

      // assert
      expect(result).toBe(false);
    });

    it('should support OAS >= v3', () => {
      // act
      const result = importer.isSupported({
        openapi: '3.0.1',
        info: { version: 'v1', title: 'example' },
        paths: {}
      });

      // assert
      expect(result).toBe(true);
    });

    it('should refuse to support of an undefined version ', () => {
      // act
      const result = importer.isSupported({
        openapi: '',
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
        `{"openapi": "3.0.0","info": {"title": "Callback Example",`
      );

      // assert
      expect(result).toBeUndefined();
      expect(importer.getErrorDetails('json')).not.toBeNull();
      expect(importer.getErrorDetails('yaml')).not.toBeNull();
    });

    it('should return the spec with expected type', async () => {
      // act
      const result = await importer.import(
        `{ "openapi": "3.0.1", "info": { "version": "v1", "title": "example" }, "servers": [{"url": "http://example.com/"}],"paths": {}}`
      );

      // assert
      expect(result).toEqual({
        type: ImporterType.OASV3,
        name: 'example v1.json',
        format: 'json',
        doc: {
          openapi: '3.0.1',
          info: { version: 'v1', title: 'example' },
          servers: [{ url: 'http://example.com/' }],
          paths: {}
        }
      });
    });
  });
});
