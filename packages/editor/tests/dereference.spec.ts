import $RefParser from '@apidevtools/json-schema-ref-parser';
import 'chai/register-should';

describe('$RefParser', () => {
  let parser: $RefParser;

  beforeEach(() => {
    parser = new $RefParser();
  });

  it('should dereference all $refs in oas v2 document', async () => {
    const inputFilePath = './tests/oas2-sample1.yaml';

    const result = await parser.dereference(inputFilePath);

    JSON.stringify(result).should.not.contain('$ref');
  });

  it('should dereference all $refs in oas v3 document', async () => {
    const inputFilePath = './tests/oas3-sample1.yaml';

    const result = await parser.dereference(inputFilePath);

    JSON.stringify(result).should.not.contain('$ref');
  });
});
