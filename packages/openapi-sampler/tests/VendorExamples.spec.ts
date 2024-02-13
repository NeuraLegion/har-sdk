import { VendorExtensions } from '../src/VendorExtensions';
import { VendorExamples } from '../src/traverse';

describe('VendorExamples', () => {
  describe('find', () => {
    let sut!: VendorExamples;

    beforeEach(() => {
      sut = new VendorExamples();
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
      const result = sut.find(schema);

      // assert
      expect(result).toMatchObject(expected);
    });

    it.each(['some-string', { name: 'some-name', points: 100 }])(
      'should ignore %j object vendor example',
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
        const result = sut.find(schema);

        // assert
        expect(result).toBe(undefined);
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
      const result = sut.find(schema);

      // assert
      expect(result).toMatchObject(expected);
    });

    it.each([
      [[{ name: 'some-name', age: 30 }]],
      2,
      'some-string',
      { name: 'some-name', points: 100 }
    ])('should ignore %j array vendor example', (input) => {
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
      const result = sut.find(schema);

      // assert
      expect(result).toBe(undefined);
    });
  });
});
