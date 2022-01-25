import {
  DefaultGenerators,
  LexicalScope,
  UrlVariableParser
} from '../src/parser';
import 'chai/register-should';

describe('UrlVariableParser', () => {
  const generators = new DefaultGenerators();

  it('should correctly handle empty string', () => {
    const scope = new LexicalScope('');
    const parser = new UrlVariableParser(generators);

    const result = parser.parse('', scope);

    result.should.equal('');
  });

  it('should return original string if it is not the path parameter', () => {
    const scope = new LexicalScope('');
    const parser = new UrlVariableParser(generators);

    const result = parser.parse('jobId', scope);

    result.should.equal('jobId');
  });

  it('should return value according to type if value is null or undefined', () => {
    const scope = new LexicalScope('', [{ key: 'jobId', type: 'number' }]);
    const parser = new UrlVariableParser(generators);

    const result = parser.parse(':jobId', scope);

    result.should.match(/\d{1,4}/);
  });

  it('should substitute single variable', () => {
    const scope = new LexicalScope('', [{ key: 'jobId', value: '1' }]);
    const parser = new UrlVariableParser(generators);

    const result = parser.parse(':jobId', scope);

    result.should.equal('1');
  });

  it('should preserve nested env variable', () => {
    const scope = new LexicalScope('', [{ key: 'jobId', value: '{{_jobId}}' }]);
    const parser = new UrlVariableParser(generators);

    const result = parser.parse(':jobId', scope);

    result.should.equal('{{_jobId}}');
  });

  it('should throw exception if variable is not defined', () => {
    const scope = new LexicalScope('', [{ key: 'foo', value: 'bar' }]);
    const parser = new UrlVariableParser(generators);

    const result = () => parser.parse(':jobId', scope);

    result.should.throw(Error, 'Undefined variable: `jobId`');
  });

  it('should throw exception if wrong value is assigned to variable (postmanlabs/openapi-to-postman#27)', () => {
    const scope = new LexicalScope('', [
      { key: 'jobId', value: 'schema type not provided' }
    ]);
    const parser = new UrlVariableParser(generators);

    const result = () => parser.parse(':jobId', scope);

    result.should.throw(Error, 'Unexpected value of `jobId` variable');
  });
});
