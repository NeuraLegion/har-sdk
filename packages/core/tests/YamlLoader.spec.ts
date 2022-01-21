import 'chai/register-should';
import { YamlLoader } from '../src/loaders/YamlLoader';
import { readFileSync } from 'fs';

describe('YamlLoader', () => {
  let loader: YamlLoader;

  beforeEach(() => {
    loader = new YamlLoader();
  });

  it(`should be an error on invalid yaml input`, () => {
    // arrange
    const input = readFileSync('./tests/fixtures/broken-yaml.txt', 'utf-8');

    // act
    try {
      loader.load(input);
    } catch {
      // noop
    }
    const result = loader.getSyntaxErrorDetails();

    // assert
    result.should.be.not.null;
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
