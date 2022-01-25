import { DefaultVariableResolver } from '../src/converter';
import {
  LexicalScope,
  DefaultGenerators,
  DefaultVariableParserFactory
} from '../src/parser';
import { Postman } from '@har-sdk/core';
import 'chai/register-should';

describe('DefaultVariableResolver', () => {
  const variableFactory = new DefaultVariableParserFactory(
    new DefaultGenerators()
  );

  let resolver!: DefaultVariableResolver;

  beforeEach(() => {
    resolver = new DefaultVariableResolver(variableFactory);
  });

  describe('resolve', () => {
    it('should resolve particular env variables', () => {
      // arrange
      const request = {
        header: [{ key: 'authorization', value: 'api-key {{apiKey}}' }],
        url: {
          protocol: '{{protocol}}',
          host: ['{{domain}}'],
          path: ['files', '{{fileId}}'],
          query: [
            {
              key: 'version',
              value: '{{apiVersion}}'
            }
          ]
        },
        body: {
          mode: 'raw',
          raw: '{"password": "{{password}}"}'
        }
      } as Postman.Request;
      const scope = new LexicalScope('', [
        { key: 'protocol', value: 'https' },
        { key: 'fileId', value: 1 },
        { key: 'apiKey', value: 'token' },
        { key: 'domain', value: 'example.com' },
        { key: 'apiVersion', value: 'v1' },
        { key: 'password', value: 'pa$$word' }
      ]);

      // act
      const result = resolver.resolve(request, scope);

      // assert
      result.should.deep.eq({
        header: [{ key: 'authorization', value: 'api-key token' }],
        url: {
          protocol: 'https',
          host: ['example.com'],
          path: ['files', '1'],
          query: [
            {
              key: 'version',
              value: 'v1'
            }
          ]
        },
        body: {
          mode: 'raw',
          raw: '{"password": "pa$$word"}'
        }
      });
    });

    it('should skip particular path variables', () => {
      // arrange
      const request = {
        url: {
          path: [':resource', ':fileId', 'metadata', ':key'],
          variable: [
            { key: 'resource', value: 'files' },
            { key: 'fileId', value: '1' },
            { key: 'key', value: 'size' }
          ]
        }
      } as Postman.Request;
      const scope = new LexicalScope('', []);

      // act
      const result = resolver.resolve(request, scope);

      // assert
      result.should.deep.eq({
        url: {
          path: ['files', '1', 'metadata', 'size'],
          variable: [
            { key: 'resource', value: 'files' },
            { key: 'fileId', value: '1' },
            { key: 'key', value: 'size' }
          ]
        }
      });
    });

    it('should resolve env variables in URL', () => {
      // arrange
      const request = {
        url: 'https://example.com/{{resource}}/{{fileId}}'
      } as Postman.Request;
      const scope = new LexicalScope('', [
        { key: 'resource', value: 'files' },
        { key: 'fileId', value: 1 }
      ]);

      // act
      const result = resolver.resolve(request, scope);

      // assert
      result.should.deep.eq({
        url: 'https://example.com/files/1'
      });
    });

    it('should skip particular env variables by excluded refs', () => {
      // arrange
      const request = {
        method: '{{method}}',
        url: {
          raw: 'https://example.com/{{resource}}/{{fileId}}',
          path: ['{{resource}}', '{{fileId}}']
        },
        proxy: {
          host: '{{proxyHost}}',
          port: 8080
        },
        certificate: {
          key: '{{certificateKey}}',
          cert: '{{certificate}}'
        },
        description: '{{description}}'
      } as Postman.Request;
      const scope = new LexicalScope('', [
        { key: 'fileId', value: 1 },
        { key: 'resource', value: 'files' }
      ]);

      // act
      const result = resolver.resolve(request, scope);

      // assert
      result.should.deep.eq({
        method: '{{method}}',
        url: {
          raw: 'https://example.com/{{resource}}/{{fileId}}',
          path: ['files', '1']
        },
        proxy: {
          host: '{{proxyHost}}',
          port: 8080
        },
        certificate: {
          key: '{{certificateKey}}',
          cert: '{{certificate}}'
        },
        description: '{{description}}'
      });
    });
  });
});
