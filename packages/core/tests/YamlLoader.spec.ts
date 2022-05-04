import { YamlLoader } from '../src/loaders/YamlLoader';
import { YAMLException } from 'js-yaml';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('YamlLoader', () => {
  let loader: YamlLoader;

  beforeEach(() => {
    loader = new YamlLoader();
  });

  it(`should throw an error on invalid yaml input`, () => {
    // arrange
    const input = readFileSync(
      resolve(__dirname, './fixtures/broken-yaml.txt'),
      'utf-8'
    );
    const expectedExceptionMessage = `bad indentation of a mapping entry (5:2)\n\n 2 |   bar: 42`;

    // assert
    expect(() => loader.load(input)).toThrowError(YAMLException);
    expect(expectedExceptionMessage).toEqual(
      expect.stringContaining(loader.getSyntaxErrorDetails().message)
    );
  });

  it(`should be no errors on valid yaml input`, () => {
    // act
    loader.load('foo: bar');
    const result = loader.getSyntaxErrorDetails();

    // assert
    expect(typeof result).toEqual('undefined');
  });
});
