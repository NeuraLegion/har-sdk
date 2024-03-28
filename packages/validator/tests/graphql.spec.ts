import { GraphQLValidator } from '../src/validator/GraphQLValidator';
import graphQLIntrospection from './fixtures/graphql.json';
import { GraphQL } from '@har-sdk/core';

describe('GraphQLValidator', () => {
  const validator = new GraphQLValidator();

  const createFixture = (schema: object = {}): GraphQL.Document => ({
    url: 'https://example.com/graphql',
    data: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      __schema: {
        description: null,
        queryType: {
          name: 'Query',
          kind: 'OBJECT'
        },
        mutationType: null,
        subscriptionType: null,
        types: [],
        directives: [],
        ...schema
      }
    }
  });

  describe('verify', () => {
    it.each([
      {
        test: 'introspection',
        input: graphQLIntrospection as unknown as GraphQL.Document
      },
      {
        test: 'fixture introspection',
        input: {
          ...createFixture()
        }
      }
    ])('should validate $test', async ({ input }) => {
      // act
      const result = await validator.verify(input);

      // assert
      expect(result).toEqual([]);
    });

    it.each([
      {
        test: 'empty url',
        input: {
          ...createFixture(),
          url: ''
        },
        expected: {
          instancePath: '/url',
          schemaPath: '#/properties/url/format',
          keyword: 'format',
          params: {
            format: 'uri'
          },
          message: 'must match format "uri"'
        }
      },
      {
        test: 'wrong url schema',
        input: {
          ...createFixture(),
          url: 'sftp://example.com/graphql'
        },
        expected: {
          instancePath: '/url',
          keyword: 'pattern',
          message: 'must match pattern "^https?://"',
          params: {
            pattern: '^https?://'
          },
          schemaPath: '#/properties/url/pattern'
        }
      },
      {
        test: 'null data node',
        input: {
          ...createFixture(),
          data: null
        },
        expected: {
          instancePath: '/data',
          schemaPath: '#/type',
          keyword: 'type',
          params: {
            type: 'object'
          },
          message: 'must be object'
        }
      },
      {
        test: 'string data node',
        input: {
          ...createFixture(),
          data: 'data'
        },
        expected: {
          instancePath: '/data',
          schemaPath: '#/type',
          keyword: 'type',
          params: {
            type: 'object'
          },
          message: 'must be object'
        }
      },
      {
        test: 'wrong _schema node',
        input: {
          ...createFixture(),
          data: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __schema: null
          }
        },
        expected: {
          instancePath: '/data/__schema',
          schemaPath: '#/type',
          keyword: 'type',
          params: {
            type: 'object'
          },
          message: 'must be object'
        }
      },
      {
        test: 'null queryType node',
        input: {
          ...createFixture({
            queryType: null
          })
        },
        expected: {
          instancePath: '/data/__schema/queryType',
          keyword: 'type',
          message: 'must be object',
          params: { type: 'object' },
          schemaPath:
            '#/definitions/IntrospectionNamedTypeRef<IntrospectionObjectType>/type'
        }
      },
      {
        test: 'missing queryType.kind node',
        input: {
          ...createFixture({
            queryType: {
              name: 'Query'
            }
          })
        },
        expected: {
          instancePath: '/data/__schema/queryType',
          keyword: 'required',
          message: "must have required property 'kind'",
          params: { missingProperty: 'kind' },
          schemaPath:
            '#/definitions/IntrospectionNamedTypeRef<IntrospectionObjectType>/required'
        }
      },
      {
        test: 'null types node',
        input: {
          ...createFixture({
            types: null
          })
        },
        expected: {
          instancePath: '/data/__schema/types',
          keyword: 'type',
          message: 'must be array',
          params: { type: 'array' },
          schemaPath: '#/properties/types/type'
        }
      },
      {
        test: 'object types node',
        input: {
          ...createFixture({
            types: {}
          })
        },
        expected: {
          instancePath: '/data/__schema/types',
          keyword: 'type',
          message: 'must be array',
          params: { type: 'array' },
          schemaPath: '#/properties/types/type'
        }
      }
    ])('should fail $test', async ({ input, expected }) => {
      // act
      const result = await validator.verify(
        input as unknown as GraphQL.Document
      );

      // assert
      expect(result).toContainEqual(expected);
    });
  });
});
