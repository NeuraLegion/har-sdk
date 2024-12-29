import { isArrayOfPrimitives } from '../src/utils/isArrayOfPrimitives';

describe('isArrayOfPrimitives', () => {
  it.each([
    {
      input: undefined,
      expected: false
    },
    {
      input: null,
      expected: false
    },
    {
      input: 'foo',
      expected: false
    },
    {
      input: () => 'foo',
      expected: false
    },
    {
      input: new Date(),
      expected: false
    },
    {
      input: new Map(),
      expected: false
    },
    {
      input: { foo: 'bar' },
      expected: false
    },
    {
      input: ['a', { bar: 'baz' }],
      expected: false
    },
    {
      input: [],
      expected: true
    },
    {
      input: ['a', 1, true],
      expected: true
    }
  ])('should return $expected when given $input', ({ input, expected }) => {
    // act
    const result = isArrayOfPrimitives(input);

    // assert
    expect(result).toBe(expected);
  });
});
