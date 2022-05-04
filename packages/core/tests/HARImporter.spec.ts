import { HARImporter, ImporterType } from '../src';

describe('HARImporter', () => {
  const importer = new HARImporter();

  describe('type', () => {
    it(`should be equal ${ImporterType.HAR}`, () =>
      expect(importer.type).toEqual(ImporterType.HAR));
  });

  describe('isSupported', () => {
    it('should refuse to support of an incompatible version', () => {
      // act
      const result = importer.isSupported({
        log: { version: '0.1', entries: [] }
      });

      // assert
      expect(result).toBe(false);
    });

    it('should support HAR v1.2', () => {
      // act
      const result = importer.isSupported({
        log: { version: '1.2', entries: [] }
      });

      // assert
      expect(result).toBe(true);
    });

    it('should refuse to support of an undefined version ', () => {
      // act
      const result = importer.isSupported({});

      // assert
      expect(result).toBe(false);
    });

    it('should refuse to support if entries are not defined', () => {
      // act
      const result = importer.isSupported({
        log: { version: '1.2' }
      });

      // assert
      expect(result).toBe(false);
    });
  });

  describe('import', () => {
    it('should return nothing if JSON file is broken', async () => {
      // act
      const result = await importer.import(
        `{ "log": { "version": "1.2", "entries": [`
      );

      // assert
      expect(typeof result).toEqual('undefined');
    });

    it('should return the spec with expected type', async () => {
      // act
      const result = await importer.import(
        `{ "log": { "version": "1.2", "entries": [] } }`
      );

      // assert
      expect(result).toEqual({
        name: undefined,
        format: 'json',
        doc: { log: { version: '1.2', entries: [] } },
        type: ImporterType.HAR
      });
    });
  });
});
