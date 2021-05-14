import { sample } from '../src';
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('$refs', () => {
  let schema: Schema;

  it('should throw if schema has $ref and spec is not provided', () => {
    schema = {
      $ref: '#/defs/Schema'
    };

    expect(() => sample(schema)).to.throw(
      /You must provide specification in the third parameter/
    );
  });
});
