import { OasV2Editor, TreeParser } from '../src';
import 'chai/register-should';
import chaiAsPromised from 'chai-as-promised';
import { use } from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';

use(chaiAsPromised);

describe('DocFormat in TreeParser', () => {
  const sourceYamlPath = './tests/fixtures/oas2-sample1.yaml';
  const sourceYaml = readFileSync(resolve(sourceYamlPath), 'utf-8');

  const sourceJsonPath = './tests/fixtures/oas2-sample1.json';
  const sourceJson = readFileSync(resolve(sourceJsonPath), 'utf-8');

  const errorMessage = 'Bad Swagger/OpenAPI V2 specification';

  describe('DocFormat', () => {
    let openApiParser: TreeParser;

    beforeEach(() => {
      openApiParser = new OasV2Editor();
    });

    it('should be exception on invalid json/yaml syntax', () => {
      const source = '{';

      return openApiParser
        .setup(source)
        .should.be.rejectedWith(Error, errorMessage);
    });

    it('should correctly parse valid yaml document without forced format', async () => {
      await openApiParser.setup(sourceYaml);

      openApiParser.format.should.eq('yaml');
      openApiParser.doc.should.be.an('object');
    });

    it('should correctly parse valid yaml document with forced "yaml" format', async () => {
      await openApiParser.setup(sourceYaml);

      openApiParser.format.should.eq('yaml');
      openApiParser.doc.should.be.an('object');
    });

    it('should refuse to parse yaml with forced "json" format', () =>
      openApiParser
        .setup(sourceYaml, 'json')
        .should.be.rejectedWith(Error, errorMessage));

    it('should correctly parse valid json document without forced format', async () => {
      await openApiParser.setup(sourceJson);

      openApiParser.format.should.eq('json');
      openApiParser.doc.should.be.an('object');
    });

    it('should correctly parse valid json document as yaml', async () => {
      await openApiParser.setup(sourceJson, 'yaml');

      openApiParser.format.should.eq('yaml');
      openApiParser.doc.should.be.an('object');
    });
  });
});
