import { VendorExtensions } from '../src';
import { VendorExampleExtractor } from '../src/traverse/VendorExampleExtractor';

describe('VendorExampleExtractor', () => {
  describe('find', () => {
    let sut!: VendorExampleExtractor;

    beforeEach(() => {
      sut = new VendorExampleExtractor();
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
          key1: {
            name: 'nameOfKey1',
            age: 30,
            points: 100
          },
          key2: {
            name: 'name',
            age: 30
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'text/plain': {
            name: 'name',
            age: 30
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'application/json': {
            key1: {
              name: 'nameOfKey1',
              age: 30,
              points: 100
            },
            key2: {
              name: 'name',
              age: 30
            }
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLES]: {
          'application/json': {
            key1: {
              name: 'nameOfKey1',
              age: 30,
              points: 100
            },
            key2: {
              name: 'name',
              age: 30
            }
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'example-name': {
            name: 'name',
            age: 30
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLES]: {
          'example-name': {
            key1: {
              name: 'nameOfKey1',
              age: 30,
              points: 100
            },
            key2: {
              name: 'name',
              age: 30
            }
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'example-name': [
            {
              name: 'nameOfExampleName',
              age: 30
            }
          ]
        },
        [VendorExtensions.X_EXAMPLES]: {
          'example-name': {
            key1: {
              name: 'nameOfKey1',
              age: 30,
              points: 100
            },
            key2: {
              name: 'name',
              age: 30
            }
          }
        }
      }
    ])('should match %j object vendor example', (input) => {
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
      const result = sut.extract(schema);

      // assert
      expect(result).toEqual(expected);
    });

    it('debug', () => {
      const input = {
        [VendorExtensions.X_EXAMPLE]: {
          'example-name': [
            {
              name: 'nameOfExampleName',
              age: 30
            }
          ]
        },
        [VendorExtensions.X_EXAMPLES]: {
          'example-name': {
            key1: {
              name: 'nameOfKey1',
              age: 30,
              points: 100
            },
            key2: {
              name: 'name',
              age: 30
            }
          }
        }
      };
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
      const result = sut.extract(schema);

      // assert
      expect(result).toEqual(expected);
    });

    it.each(['some-string', { name: 'some-name', points: 100 }])(
      'should ignore %j when example shape does not satisfy the object schema',
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
        const result = sut.extract(schema);

        // assert
        expect(result).toBe(undefined);
      }
    );

    it.each([
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
          key1: [
            {
              name: 'nameOfKey1',
              age: 30,
              points: 100
            }
          ],
          key2: [
            {
              name: 'name',
              age: 30
            }
          ]
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'text/plain': [
            {
              name: 'name',
              age: 30
            }
          ]
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'application/json': {
            key1: [
              {
                name: 'nameOfKey1',
                age: 30,
                points: 100
              }
            ],
            key2: [
              {
                name: 'name',
                age: 30
              }
            ]
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLES]: {
          'application/json': {
            key1: [
              {
                name: 'nameOfKey1',
                age: 30,
                points: 100
              }
            ],
            key2: [
              {
                name: 'name',
                age: 30
              }
            ]
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'example-name': [
            {
              name: 'name',
              age: 30
            }
          ]
        }
      },
      {
        [VendorExtensions.X_EXAMPLES]: {
          'example-name': {
            key1: [
              {
                name: 'nameOfKey1',
                age: 30,
                points: 100
              }
            ],
            key2: [
              {
                name: 'name',
                age: 30
              }
            ]
          }
        }
      },
      {
        [VendorExtensions.X_EXAMPLE]: {
          'example-name': [
            {
              name: 'nameOfExampleName',
              age: 30,
              points: 100
            }
          ]
        },
        [VendorExtensions.X_EXAMPLES]: {
          'example-name': {
            key0: {
              name: 'nameOfKey0',
              age: 30
            },
            key1: [
              {
                name: 'nameOfKey1',
                age: 30,
                points: 100
              }
            ],
            key2: [
              {
                name: 'name',
                age: 30
              }
            ]
          }
        }
      }
    ])('should match %j array vendor example', (input) => {
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
      const result = sut.extract(schema);

      // assert
      expect(result).toEqual(expected);
    });

    it.each([
      [[{ name: 'some-name', age: 30 }]],
      2,
      'some-string',
      { name: 'some-name', points: 100 }
    ])(
      'should ignore %j when example shape does not satisfy the array schema',
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
        const result = sut.extract(schema);

        // assert
        expect(result).toBe(undefined);
      }
    );
  });
});
