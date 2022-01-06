import { EnvVariableParser, DefaultGenerators } from '../src/parser';
import 'chai/register-should';

describe('EnvVariableParser', () => {
  const generators = new DefaultGenerators();

  it('should correctly handle empty string', () => {
    const parser = new EnvVariableParser([], generators);

    const result = parser.parse('');

    result.should.equal('');
  });

  it('should return original string in case of missing variables', () => {
    const parser = new EnvVariableParser(
      [{ key: 'baseURL', value: 'https://test.com' }],
      generators
    );

    const result = parser.parse('{{baseUrl}}');

    result.should.equal('{{baseUrl}}');
  });

  it('should substitute single variable', () => {
    const parser = new EnvVariableParser(
      [{ key: 'baseUrl', value: 'https://test.com' }],
      generators
    );

    const result = parser.parse('{{baseUrl}}/api/v1');

    result.should.equal('https://test.com/api/v1');
  });

  it('should substitute dynamic variable', () => {
    const parser = new EnvVariableParser(
      [{ key: 'baseUrl', value: 'https://test.com/{{$randomInt}}' }],
      generators
    );

    const result = parser.parse('{{baseUrl}}');

    result.should.match(/^https:\/\/test\.com\/\d{1,4}$/);
  });

  it('should substitute nested variables', () => {
    const parser = new EnvVariableParser(
      [
        { key: 'baseUrl', value: 'https://{{hostname}}/{{path}}' },
        { key: 'hostname', value: '{{companyName}}.{{domainTld}}' },
        { key: 'path', value: 'api/v1' },
        { key: 'companyName', value: 'test' },
        { key: 'domainTld', value: 'com' }
      ],
      generators
    );

    const result = parser.parse('{{baseUrl}}');

    result.should.equal('https://test.com/api/v1');
  });

  it('should substitute nested dynamic variables', () => {
    const parser = new EnvVariableParser(
      [
        { key: 'baseUrl', value: 'https://{{hostname}}/{{path}}' },
        { key: 'hostname', value: '{{companyName}}.{{domainTld}}' },
        { key: 'path', value: 'api/v1' },
        { key: 'companyName', value: 'test' },
        { key: 'domainTld', value: '{{$randomAbbreviation}}' }
      ],
      generators
    );

    const result = parser.parse('{{baseUrl}}');

    result.should.match(/https:\/\/test\.[A-Z]+\/api\/v1/);
  });
});
