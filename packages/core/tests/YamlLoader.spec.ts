import 'chai/register-should';
import { YamlLoader } from '../src/loaders/YamlLoader';
import { YAMLException } from 'js-yaml';
import { readFileSync } from 'fs';

describe('YamlLoader', () => {
  let loader: YamlLoader;

  beforeEach(() => {
    loader = new YamlLoader();
  });

  it(`should throw an error on invalid yaml input`, () => {
    // arrange
    const input = readFileSync('./tests/fixtures/broken-yaml.txt', 'utf-8');
    const expectedExceptionMessage = `bad indentation of a mapping entry (5:2)\n\n 2 |   bar: 42`;

    // assert
    (() => loader.load(input)).should.throw(
      YAMLException,
      expectedExceptionMessage
    );
    expectedExceptionMessage.should.include(
      loader.getSyntaxErrorDetails().message
    );
  });

  it(`should be no errors on valid yaml input`, () => {
    // act
    try {
      loader.load('foo: bar');
    } catch {
      // noop
    }
    const result = loader.getSyntaxErrorDetails();

    // assert
    (typeof result).should.eq('undefined');
  });
});
