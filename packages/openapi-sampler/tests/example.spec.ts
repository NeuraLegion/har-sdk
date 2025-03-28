import { VendorExtensions, sample } from '../src';

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

  it('should use examples', () => {
    // arrange
    const example1 = {
      test: 'test'
    };

    const schema = {
      type: 'object',
      properties: {
        test: {
          type: 'string'
        }
      },
      examples: [
        example1,
        {
          test: 'lorem'
        }
      ]
    };

    // act
    const result = sample(schema);

    // assert
    expect(result).toEqual(example1);
  });

  it('should use falsy examples', () => {
    // arrange
    const schema = {
      type: 'boolean',
      examples: [false, true]
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

  it('should prefer schema examples over vendor when includeVendorExamples is true', () => {
    // arrange
    const schema = {
      type: 'string',
      [VendorExtensions.X_EXAMPLE]: 'foo',
      [VendorExtensions.X_EXAMPLES]: 'bar',
      examples: ['baz', 'cux']
    };

    // act
    const result = sample(schema, { includeVendorExamples: true });

    // assert
    expect(result).toEqual('baz');
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
});
