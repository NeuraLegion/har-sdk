import { VendorExtensions } from '../src/VendorExtensions';
import { sample } from '../src';

describe('Example', () => {
  it('should use example', () => {
    // arrange
    const obj = {
      test: 'test',
      properties: {
        test: {
          type: 'string'
        }
      }
    };
    const schema = {
      type: 'object',
      example: obj
    };

    // act
    const result = sample(schema);

    // assert
    expect(result).toEqual(obj);
  });

  it('should use falsy example', () => {
    // arrange
    const schema = {
      type: 'string',
      example: false
    };

    // act
    const result = sample(schema);

    // assert
    expect(result).toEqual(false);
  });

  it('should use enum', () => {
    // arrange
    const enumList = ['test1', 'test2'];
    const schema = {
      type: 'string',
      enum: enumList
    };

    // act
    const result = sample(schema);

    // assert
    expect(result).toEqual(enumList[0]);
  });

  it.each([false, undefined])(
    'should not use vendor example when includeVendorExamples is %s',
    (input) => {
      // arrange
      const schema = {
        type: 'string',
        [VendorExtensions.X_EXAMPLE]: 'foo'
      };

      // act
      const result = sample(schema, { includeVendorExamples: input });

      // assert
      expect(result).toEqual('lorem');
    }
  );

  it('should prefer schema example over vendor example when includeVendorExamples is true', () => {
    // arrange
    const schema = {
      type: 'string',
      [VendorExtensions.X_EXAMPLE]: 'foo',
      example: 'bar'
    };

    // act
    const result = sample(schema, { includeVendorExamples: true });

    // assert
    expect(result).toEqual('bar');
  });

  it('should prefer vendor example over default when includeVendorExamples is true', () => {
    // arrange
    const schema = {
      type: 'string',
      [VendorExtensions.X_EXAMPLE]: 'foo',
      default: 'bar'
    };

    // act
    const result = sample(schema, { includeVendorExamples: true });

    // assert
    expect(result).toEqual('foo');
  });

  it.each([
    {
      [VendorExtensions.X_EXAMPLE]: {
        name: 'name',
        age: 30
      }
    },
    {
      [VendorExtensions.X_EXAMPLE]: {
        'application/json': {
          name: 'name',
          age: 30
        }
      }
    },
    {
      [VendorExtensions.X_EXAMPLES]: {
        'application/json': {
          name: 'name',
          age: 30
        }
      }
    },
    {
      [VendorExtensions.X_EXAMPLES]: {
        'application/json': {
          some: {
            name: 'name',
            age: 30
          }
        }
      }
    },
    {
      [VendorExtensions.X_EXAMPLES]: {
        'application/json': {
          some: {
            name: 'name',
            age: 30
          }
        }
      }
    },
    {
      [VendorExtensions.X_EXAMPLES]: [
        {
          name: 'name',
          age: 30
        }
      ]
    },
    {
      [VendorExtensions.X_EXAMPLES]: {
        'application/json': [
          {
            name: 'name',
            age: 30
          }
        ]
      }
    }
  ])(
    'should match %j object vendor example when includeVendorExamples is true',
    (input) => {
      // arrange
      const expected = {
        name: 'name',
        age: 30
      };

      const schema = {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          age: {
            type: 'integer'
          }
        },
        ...input
      };

      // act
      const result = sample(schema, { includeVendorExamples: true });

      // assert
      expect(result).toMatchObject(expected);
    }
  );

  it.each(['some-string', { name: 'some-name', points: 100 }])(
    'should ignore %j object vendor example when includeVendorExamples is true',
    (input) => {
      // arrange
      const schema = {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          age: {
            type: 'integer'
          }
        },
        [VendorExtensions.X_EXAMPLES]: {
          'some-example': input
        }
      };

      // act
      const result = sample(schema, { includeVendorExamples: true });

      // assert
      expect(result).toMatchObject({ age: 42, name: 'lorem' });
    }
  );

  it.each([
    [
      {
        [VendorExtensions.X_EXAMPLE]: [
          {
            name: 'name',
            age: 30
          }
        ]
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'application/json': [
            {
              name: 'name',
              age: 30
            }
          ]
        }
      },
      {
        [VendorExtensions.X_EXAMPLES]: {
          'application/json': [
            {
              name: 'name',
              age: 30
            }
          ]
        }
      },
      {
        [VendorExtensions.X_EXAMPLES]: {
          'application/json': [
            {
              some: {
                name: 'name',
                age: 30
              }
            }
          ]
        }
      },
      {
        [VendorExtensions.X_EXAMPLES]: [
          {
            name: 'name',
            age: 30
          }
        ]
      },
      {
        [VendorExtensions.X_EXAMPLES]: {
          'application/json': [
            {
              name: 'name',
              age: 30
            }
          ]
        }
      }
    ]
  ])(
    'should match %j array vendor example when includeVendorExamples is true',
    (input) => {
      // arrange
      const expected = [
        {
          name: 'name',
          age: 30
        }
      ];

      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            age: {
              type: 'integer'
            }
          }
        },
        ...input
      };

      // act
      const result = sample(schema, { includeVendorExamples: true });

      // assert
      expect(result).toMatchObject(expected);
    }
  );

  it.each([
    [[{ name: 'some-name', age: 30 }]],
    2,
    'some-string',
    { name: 'some-name', points: 100 }
  ])(
    'should ignore %j array vendor example when includeVendorExamples is true',
    (input) => {
      // arrange
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            age: {
              type: 'integer'
            }
          }
        },
        [VendorExtensions.X_EXAMPLES]: {
          'some-example': input
        }
      };

      // act
      const result = sample(schema, { includeVendorExamples: true });

      // assert
      expect(result).toMatchObject([{ age: 42, name: 'lorem' }]);
    }
  );
});
