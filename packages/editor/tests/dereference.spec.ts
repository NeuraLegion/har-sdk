import $RefParser from '@apidevtools/json-schema-ref-parser';
import { resolve } from 'path';

describe('$RefParser', () => {
  let parser: $RefParser;

  beforeEach(() => {
    parser = new $RefParser();
  });

  it('should dereference all $refs in oas v2 document', async () => {
    const inputFilePath = resolve(__dirname, './fixtures/oas2-sample1.yaml');

    const result = await parser.dereference(inputFilePath);

    expect(JSON.stringify(result)).toEqual(
      expect.not.arrayContaining(['$ref'])
    );
  });

  it('should dereference all $refs in oas v3 document', async () => {
    const inputFilePath = resolve(__dirname, './fixtures/oas3-sample1.yaml');

    const result = await parser.dereference(inputFilePath);

    expect(JSON.stringify(result)).toEqual(
      expect.not.arrayContaining(['$ref'])
    );
  });
});
