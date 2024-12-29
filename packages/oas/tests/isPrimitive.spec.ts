import { isPrimitive } from '../src/utils/isPrimitive';

describe('isPrimitive', () => {
  it.each([
    {
      input: undefined,
      expected: true
    },
    {
      input: null,
      expected: true
    },
    {
      input: 'foo',
      expected: true
    },
    {
      input: () => 'foo',
      expected: false
    },
    {
      input: [],
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
      input: () => 'foo',
      expected: false
    }
  ])('should return $expected when given $input', ({ input, expected }) => {
    // act
    const result = isPrimitive(input);

    // assert
    expect(result).toBe(expected);
  });
});
