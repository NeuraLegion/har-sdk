import { sample } from '../src';
import 'chai/register-should';

describe('$refs', () => {
  it('should throw if schema has $ref and spec is not provided', () => {
    const schema = {
      $ref: '#/defs/Schema'
    };

    (() => sample(schema)).should.throw(
      /You must provide specification in the third parameter/
    );
  });
});
