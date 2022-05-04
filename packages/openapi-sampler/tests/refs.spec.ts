import { sample } from '../src';

describe('$refs', () => {
  it('should throw if schema has $ref and spec is not provided', () => {
    const schema = {
      $ref: '#/defs/Schema'
    };

    expect(() => sample(schema)).toThrowError(
      /You must provide specification in the third parameter/
    );
  });
});
