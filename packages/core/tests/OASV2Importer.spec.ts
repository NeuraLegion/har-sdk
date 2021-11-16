import 'chai/register-should';
import { ImporterType, OASV2Importer } from '../src';

describe('OASV2Importer', () => {
  const importer = new OASV2Importer();

  describe('type', () => {
    it(`should be equal ${ImporterType.OASV2}`, () =>
      importer.type.should.eq(ImporterType.OASV2));
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
      result.should.be.true;
    });

    it('should refuse to support of an incompatibility version', () => {
      // act
      const result = importer.isSupported({
        openapi: '3.0.0',
        info: { version: 'v1', title: 'example' },
        paths: {}
      });

      // assert
      result.should.be.false;
    });

    it('should refuse to support of an undefined version', () => {
      // act
      const result = importer.isSupported({
        swagger: '',
        info: { version: 'v1', title: 'example' },
        paths: {}
      });

      // assert
      result.should.be.false;
    });
  });

  describe('importSpec', () => {
    it('should return nothing if JSON file is broken', async () => {
      // act
      const result = await importer.importSpec(
        `{"swagger": "2.0","info": {"title": "Example",`
      );

      // assert
      (typeof result).should.eq('undefined');
    });

    it('should return the spec with expected type', async () => {
      // act
      const result = await importer.importSpec(
        `{ "swagger": "2.0", "info": { "version": "v1", "title": "example" }, "host": "example.com","paths": {}}`
      );

      // assert
      result.should.deep.eq({
        type: ImporterType.OASV2,
        name: 'example v1.har',
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
