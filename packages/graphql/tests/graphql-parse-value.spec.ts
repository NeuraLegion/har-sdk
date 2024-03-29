import { graphQLParseValue } from '../src/utils/graphql-parse-value';

describe('graphQLParseValue', () => {
  it.each([
    { input: 'null', expected: null },
    { input: 'foo', expected: 'foo' },
    { input: '"bar"', expected: 'bar' },
    { input: 'true', expected: true },
    { input: 'false', expected: false },
    { input: '-1', expected: -1 },
    { input: '-1.23', expected: -1.23 },
    { input: '[]', expected: [] },
    { input: '[[]]', expected: [[]] },
    { input: '{}', expected: {} },
    { input: '{ foo: {} }', expected: { foo: {} } },
    { input: '{ foo: [1,2] }', expected: { foo: [1, 2] } },
    {
      input: '[{ foo: [[{ bar: { baz: 3, qux: METER } }]] }]',
      expected: [{ foo: [[{ bar: { baz: 3, qux: 'METER' } }]] }]
    }
  ])('should return "$expected" for "$input"', ({ input, expected }) => {
    // act
    const result = graphQLParseValue(input);
    // assert
    expect(result).toStrictEqual(expected);
  });
});
