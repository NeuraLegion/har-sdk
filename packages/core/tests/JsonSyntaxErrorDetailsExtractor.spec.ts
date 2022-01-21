import 'chai/register-should';
import { JsonSyntaxErrorDetailsExtractor } from '../src/loaders/errors';

describe('JsonSyntaxErrorDetailsExtractor', () => {
  let extractor: JsonSyntaxErrorDetailsExtractor;

  beforeEach(() => {
    extractor = new JsonSyntaxErrorDetailsExtractor();
  });

  it(`should support non-standard lineNumber and columnNumber`, () => {
    // arrange
    const inputSource = new Array(10).fill('12345').join('\n');
    const inputError = {
      message: 'error',
      lineNumber: 3,
      columnNumber: 4
    } as unknown as SyntaxError;

    // act
    const result = extractor.extract(inputError, inputSource);

    // assert
    result.should.be.deep.eq({
      message: 'error',
      offset: 15
    });
  });

  it(`should extract details from firefox-style errors`, () => {
    // arrange
    const inputSource = `{\n\n"key": "value\n}`;
    const inputError = new SyntaxError(
      'JSON.parse: bad control character in string literal at line 3 column 16 of the JSON data'
    );

    // act
    const result = extractor.extract(inputError, inputSource);

    // assert
    result.should.be.deep.eq({
      message: 'bad control character in string literal',
      offset: 18
    });
  });

  it(`should extract details from chrome-style errors`, () => {
    // arrange
    const inputSource = `{\n\n"key": "value\n}`;
    const inputError = new SyntaxError(
      'Unexpected token \\n in JSON at position 17'
    );

    // act
    const result = extractor.extract(inputError, inputSource);

    // assert
    result.should.be.deep.eq({
      message: 'Unexpected token \\n in JSON',
      offset: 17
    });
  });

  it(`should returned zero-based offset`, () => {
    // arrange
    const inputSource = 'abc';
    const inputError = {
      message: 'custom',
      lineNumber: 1,
      columnNumber: 1
    } as unknown as SyntaxError;

    // act
    const result = extractor.extract(inputError, inputSource);

    // assert
    result.should.be.deep.eq({
      message: 'custom',
      offset: 0
    });
  });

  it(`should limit returned offset to source length`, () => {
    // arrange
    const inputSource = 'abc';
    const inputError = {
      message: 'custom',
      lineNumber: 42,
      columnNumber: 42
    } as unknown as SyntaxError;

    // act
    const result = extractor.extract(inputError, inputSource);

    // assert
    result.should.be.deep.eq({
      message: 'custom',
      offset: inputSource.length
    });
  });
});
