import { sample } from '../src';
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('Primitives', () => {
  let schema: Schema;
  let result;
  let expected;

  it('should sample string', () => {
    schema = {
      type: 'string'
    };
    result = sample(schema);
    expected = 'string';
    expect(typeof result).to.deep.equal(expected);
  });
  it('should sample number', () => {
    schema = {
      type: 'number'
    };
    result = sample(schema);
    expected = 'number';
    expect(typeof result).to.deep.equal(expected);
  });
  it('should sample boolean', () => {
    schema = {
      type: 'boolean'
    };
    result = sample(schema);
    expected = true;
    expect(typeof result).to.deep.equal('boolean');
  });
  it('should use default property', () => {
    schema = {
      type: 'number',
      default: 100
    };
    result = sample(schema);
    expected = 100;
    expect(result).to.deep.equal(expected);
  });
  it('should use null if type is not specified', () => {
    schema = {};
    result = sample(schema);
    expected = null;
    expect(result).to.deep.equal(expected);
  });
});
