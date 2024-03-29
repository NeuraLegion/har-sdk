import { isGraphQLPrimitive } from '../src/utils/is-graphql-primitive';
import { type IntrospectionOutputTypeRef } from 'graphql';

describe('isGraphQLPrimitive', () => {
  it.each([
    { input: { kind: '' }, expected: false },
    { input: { kind: 'SCALAR', name: 'foo' }, expected: true },
    { input: { kind: 'ENUM', name: 'bar' }, expected: true }
  ])('should return "$expected" for "$input"', ({ input, expected }) => {
    // act
    const res = isGraphQLPrimitive(
      input as unknown as IntrospectionOutputTypeRef
    );
    // assert
    expect(res).toBe(expected);
  });
});
