import { sample } from '../src';
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('oneOf and anyOf', () => {
  let schema: Schema;
  let result;
  let expected;

  it('should support oneOf', () => {
    schema = {
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'number'
        }
      ]
    };
    result = sample(schema);
    expected = ['string', 'number'];
    expect(typeof result).to.be.oneOf(expected);
  });

  it('should support anyOf', () => {
    schema = {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'number'
        }
      ]
    };
    result = sample(schema);
    expected = ['string', 'number'];
    expect(typeof result).to.be.oneOf(expected);
  });

  it('should prefer oneOf if anyOf and oneOf are on the same level ', () => {
    schema = {
      anyOf: [
        {
          type: 'string'
        }
      ],
      oneOf: [
        {
          type: 'number'
        }
      ]
    };
    result = sample(schema);
    expect(typeof result).to.equal('number');
  });
});
