import 'chai/register-should';
import { SyntaxErrorDetails } from '../src/loaders';
import { YamlSyntaxErrorDetailsExtractor } from '../src/loaders/errors';
import { YAMLException } from 'js-yaml';
import { readFileSync } from 'fs';

describe('YamlSyntaxErrorDetailsExtractor', () => {
  let extractor: YamlSyntaxErrorDetailsExtractor;

  beforeEach(() => {
    extractor = new YamlSyntaxErrorDetailsExtractor();
  });

  it(`should extract yaml error details`, () => {
    // arrange
    const input = readFileSync('./tests/fixtures/broken-yaml.txt', 'utf-8');
    const inputError = new YAMLException(
      `YAMLException: bad indentation of a mapping entry (5:3)

 2 |   bar: 42
 3 | dummy:
 4 |  'item1'
 5 |   item2
-------^
 6 | x:
 7 |   y: 42`
    );
    const expected: SyntaxErrorDetails = {
      message: 'bad indentation of a mapping entry (5:3)',
      offset: 33,
      snippet: ` 2 |   bar: 42
 3 | dummy:
 4 |  'item1'
 5 |   item2
-------^
 6 | x:
 7 |   y: 42`
    };

    // act
    const result = extractor.extract(inputError, input);

    // assert
    result.should.deep.eq(expected);
  });
});
