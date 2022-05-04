import { OasV2Editor, TreeParser } from '../src';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('DocFormat in TreeParser', () => {
  const sourceYamlPath = './fixtures/oas2-sample1.yaml';
  const sourceYaml = readFileSync(resolve(__dirname, sourceYamlPath), 'utf-8');

  const sourceJsonPath = './fixtures/oas2-sample1.json';
  const sourceJson = readFileSync(resolve(__dirname, sourceJsonPath), 'utf-8');

  const errorMessage = 'Bad Swagger/OpenAPI V2 specification';

  describe('DocFormat', () => {
    let openApiParser: TreeParser;

    beforeEach(() => {
      openApiParser = new OasV2Editor();
    });

    it('should be exception on invalid json/yaml syntax', async () => {
      const source = '{';
      const setupPromise = openApiParser.setup(source);
      await expect(setupPromise).rejects.toThrowError(Error);
      await expect(setupPromise).rejects.toMatchObject({
        message: errorMessage
      });
    });

    it('should correctly parse valid yaml document without forced format', async () => {
      await openApiParser.setup(sourceYaml);

      expect(openApiParser.format).toEqual('yaml');
      expect(openApiParser.doc).toBeInstanceOf(Object);
    });

    it('should correctly parse valid yaml document with forced "yaml" format', async () => {
      await openApiParser.setup(sourceYaml);

      expect(openApiParser.format).toEqual('yaml');
      expect(openApiParser.doc).toBeInstanceOf(Object);
    });

    it('should refuse to parse yaml with forced "json" format', async () => {
      const setupPromise = openApiParser.setup(sourceYaml, 'json');
      await expect(setupPromise).rejects.toThrowError(Error);
      await expect(setupPromise).rejects.toMatchObject({
        message: errorMessage
      });
    });

    it('should correctly parse valid json document without forced format', async () => {
      await openApiParser.setup(sourceJson);

      expect(openApiParser.format).toEqual('json');
      expect(openApiParser.doc).toBeInstanceOf(Object);
    });

    it('should correctly parse valid json document as yaml', async () => {
      await openApiParser.setup(sourceJson, 'yaml');

      expect(openApiParser.format).toEqual('yaml');
      expect(openApiParser.doc).toBeInstanceOf(Object);
    });
  });
});
