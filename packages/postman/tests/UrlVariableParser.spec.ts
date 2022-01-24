import {
  DefaultGenerators,
  LexicalScope,
  UrlVariableParser
} from '../src/parser';
import 'chai/register-should';

describe('UrlVariableParser', () => {
  const generators = new DefaultGenerators();

  it('should correctly handle empty string', () => {
    const parser = new UrlVariableParser(new LexicalScope(''), generators);

    const result = parser.parse('');

    result.should.equal('');
  });

  it('should return original string if it is not the path parameter', () => {
    const parser = new UrlVariableParser(new LexicalScope(''), generators);

    const result = parser.parse('jobId');

    result.should.equal('jobId');
  });

  it('should return value according to type if value is null or undefined', () => {
    const parser = new UrlVariableParser(
      new LexicalScope('', [{ key: 'jobId', type: 'number' }]),
      generators
    );

    const result = parser.parse(':jobId');

    result.should.match(/\d{1,4}/);
  });

  it('should substitute single variable', () => {
    const parser = new UrlVariableParser(
      new LexicalScope('', [{ key: 'jobId', value: '1' }]),
      generators
    );

    const result = parser.parse(':jobId');

    result.should.equal('1');
  });

  it('should preserve nested env variable', () => {
    const parser = new UrlVariableParser(
      new LexicalScope('', [{ key: 'jobId', value: '{{_jobId}}' }]),
      generators
    );

    const result = parser.parse(':jobId');

    result.should.equal('{{_jobId}}');
  });

  it('should throw exception if variable is not defined', () => {
    const parser = new UrlVariableParser(
      new LexicalScope('', [{ key: 'foo', value: 'bar' }]),
      generators
    );

    const result = () => parser.parse(':jobId');

    result.should.throw(Error, 'Undefined variable: `jobId`');
  });

  it('should throw exception if wrong value is assigned to variable (postmanlabs/openapi-to-postman#27)', () => {
    const parser = new UrlVariableParser(
      new LexicalScope('', [
        { key: 'jobId', value: 'schema type not provided' }
      ]),
      generators
    );

    const result = () => parser.parse(':jobId');

    result.should.throw(Error, 'Unexpected value of `jobId` variable');
  });
});
