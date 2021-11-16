import 'chai/register-should';
import { ImporterType, Spec, SpecExplorer } from '../src';
import { load } from 'js-yaml';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { promisify } from 'util';
import { readFile } from 'fs';
import { resolve } from 'path';

use(chaiAsPromised);

describe('SpecExplorer', () => {
  let specExplorer: SpecExplorer;

  beforeEach(() => {
    specExplorer = new SpecExplorer();
  });

  describe('tryToImportSpec', () => {
    it('should import OAS v2 (JSON)', async () => {
      // arrange
      const doc = await import('./fixtures/oas-v2.json');
      const input = JSON.stringify(doc);
      const expected = {
        doc,
        format: 'json',
        type: ImporterType.OASV2,
        name: 'Test Plain Post Data 1.0.json'
      };

      // act
      const result: Spec<ImporterType.OASV2> =
        await specExplorer.tryToImportSpec(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should import OAS v2 (YAML)', async () => {
      // arrange
      const input = await promisify(readFile)(
        resolve('./tests/fixtures/oas-v2.yaml'),
        'utf8'
      );
      const doc = load(input, { json: true });
      const expected = {
        doc,
        format: 'yaml',
        type: ImporterType.OASV2,
        name: 'Test Plain Post Data 1.0.yaml'
      };

      // act
      const result: Spec<ImporterType.OASV2> =
        await specExplorer.tryToImportSpec(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should import OAS v3 (JSON)', async () => {
      // arrange
      const doc = await import('./fixtures/oas-v3.json');
      const input = JSON.stringify(doc);
      const expected = {
        doc,
        format: 'json',
        type: ImporterType.OASV3,
        name: 'Test Plain Post Data 1.0.json'
      };

      // act
      const result: Spec<ImporterType.OASV3> =
        await specExplorer.tryToImportSpec(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should import OAS v3 (YAML)', async () => {
      // arrange
      const input = await promisify(readFile)(
        resolve('./tests/fixtures/oas-v3.yaml'),
        'utf8'
      );
      const doc = load(input, { json: true });
      const expected = {
        doc,
        format: 'yaml',
        type: ImporterType.OASV3,
        name: 'Test Plain Post Data 1.0.yaml'
      };

      // act
      const result: Spec<ImporterType.OASV3> =
        await specExplorer.tryToImportSpec(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should import Postman collection v2.0.0', async () => {
      // arrange
      const doc = await import('./fixtures/postman-v2.json');
      const input = JSON.stringify(doc);
      const expected = {
        doc,
        format: 'json',
        type: ImporterType.POSTMAN,
        name: 'Swagger Petstore.json'
      };

      // act
      const result: Spec<ImporterType.POSTMAN> =
        await specExplorer.tryToImportSpec(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should import Postman collection v2.1.0', async () => {
      // arrange
      const doc = await import('./fixtures/postman-v2.1.json');
      const input = JSON.stringify(doc);
      const expected = {
        doc,
        format: 'json',
        type: ImporterType.POSTMAN,
        name: 'Swagger Petstore.json'
      };

      // act
      const result: Spec<ImporterType.POSTMAN> =
        await specExplorer.tryToImportSpec(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should import HAR', async () => {
      // arrange
      const doc = await import('./fixtures/har.json');
      const expected = {
        doc,
        name: undefined as string,
        format: 'json',
        type: ImporterType.HAR
      };
      const input = JSON.stringify(doc);

      // act
      const result = await specExplorer.tryToImportSpec(input);

      // assert
      result.should.deep.eq(expected);
    });

    it('should raise an error if no importers found', async () => {
      // arrange
      const doc = { foo: 'bar' };
      const input = JSON.stringify(doc);

      // act
      const promise = specExplorer.tryToImportSpec(input);

      // assert
      await promise.should.be.rejectedWith(
        Error,
        'No importers found for the file'
      );
    });
  });
});
