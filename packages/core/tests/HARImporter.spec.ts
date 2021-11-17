import 'chai/register-should';
import { HARImporter, ImporterType } from '../src';

describe('HARImporter', () => {
  const importer = new HARImporter();

  describe('type', () => {
    it(`should be equal ${ImporterType.HAR}`, () =>
      importer.type.should.eq(ImporterType.HAR));
  });

  describe('isSupported', () => {
    it('should refuse to support of an incompatible version', () => {
      // act
      const result = importer.isSupported({
        log: { version: '0.1', entries: [] }
      });

      // assert
      result.should.be.false;
    });

    it('should support HAR v1.2', () => {
      // act
      const result = importer.isSupported({
        log: { version: '1.2', entries: [] }
      });

      // assert
      result.should.be.true;
    });

    it('should refuse to support of an undefined version ', () => {
      // act
      const result = importer.isSupported({});

      // assert
      result.should.be.false;
    });

    it('should refuse to support if entries are not defined', () => {
      // act
      const result = importer.isSupported({
        log: { version: '1.2' }
      });

      // assert
      result.should.be.false;
    });
  });

  describe('importSpec', () => {
    it('should return nothing if JSON file is broken', async () => {
      // act
      const result = await importer.importSpec(
        `{ "log": { "version": "1.2", "entries": [`
      );

      // assert
      (typeof result).should.eq('undefined');
    });

    it('should return the spec with expected type', async () => {
      // act
      const result = await importer.importSpec(
        `{ "log": { "version": "1.2", "entries": [] } }`
      );

      // assert
      result.should.deep.eq({
        name: undefined,
        format: 'json',
        doc: { log: { version: '1.2', entries: [] } },
        type: ImporterType.HAR
      });
    });
  });
});
