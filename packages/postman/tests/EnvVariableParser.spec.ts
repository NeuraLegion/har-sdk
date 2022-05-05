import {
  EnvVariableParser,
  DefaultGenerators,
  LexicalScope
} from '../src/parser';

describe('EnvVariableParser', () => {
  const generators = new DefaultGenerators();

  it('should correctly handle empty string', () => {
    const parser = new EnvVariableParser(generators);
    const scope = new LexicalScope('');

    const result = parser.parse('', scope);

    expect(result).toEqual('');
  });

  it('should return original string if value is null or undefined', () => {
    const parser = new EnvVariableParser(generators);
    const scope = new LexicalScope('', [{ key: 'baseUrl' }]);

    const result = parser.parse('{{baseUrl}}', scope);

    expect(result).toEqual('{{baseUrl}}');
  });

  it('should substitute single variable', () => {
    const parser = new EnvVariableParser(generators);
    const scope = new LexicalScope('', [
      { key: 'baseUrl', value: 'https://test.com' }
    ]);

    const result = parser.parse('{{baseUrl}}/api/v1', scope);

    expect(result).toEqual('https://test.com/api/v1');
  });

  it('should substitute dynamic variable', () => {
    const parser = new EnvVariableParser(generators);
    const scope = new LexicalScope('', [
      { key: 'baseUrl', value: 'https://test.com/{{$randomInt}}' }
    ]);

    const result = parser.parse('{{baseUrl}}', scope);

    expect(result).toMatch(/^https:\/\/test\.com\/\d{1,4}$/);
  });

  it('should substitute nested variables', () => {
    const scope = new LexicalScope('', [
      { key: 'baseUrl', value: 'https://{{hostname}}/{{path}}' },
      { key: 'hostname', value: '{{companyName}}.{{domainTld}}' },
      { key: 'path', value: 'api/v1' },
      { key: 'companyName', value: 'test' },
      { key: 'domainTld', value: 'com' }
    ]);
    const parser = new EnvVariableParser(generators);

    const result = parser.parse('{{baseUrl}}', scope);

    expect(result).toEqual('https://test.com/api/v1');
  });

  it('should substitute nested dynamic variables', () => {
    const scope = new LexicalScope('', [
      { key: 'baseUrl', value: 'https://{{hostname}}/{{path}}' },
      { key: 'hostname', value: '{{companyName}}.{{domainTld}}' },
      { key: 'path', value: 'api/v1' },
      { key: 'companyName', value: 'test' },
      { key: 'domainTld', value: '{{$randomAbbreviation}}' }
    ]);
    const parser = new EnvVariableParser(generators);

    const result = parser.parse('{{baseUrl}}', scope);

    expect(result).toMatch(/https:\/\/test\.[A-Z]+\/api\/v1/);
  });

  it('should throw exception if variable is not defined', () => {
    const scope = new LexicalScope('', [{ key: 'foo', value: 'bar' }]);
    const parser = new EnvVariableParser(generators);

    const result = () => parser.parse('{{baseUrl}}', scope);

    expect(result).toThrowError('Undefined variable: `baseUrl`');
  });

  it('should throw exception on missing nested variable', () => {
    const scope = new LexicalScope('', [
      { key: 'baseUrl', value: 'https://{{hostname}}' }
    ]);
    const parser = new EnvVariableParser(generators);

    const result = () => parser.parse('{{baseUrl}}', scope);

    expect(result).toThrowError('Undefined variable: `hostname`');
  });
});
