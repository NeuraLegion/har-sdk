import { sample } from '../src';
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('Example', () => {
  let schema: Schema;
  let result;
  let expected;

  it('should use example', () => {
    const obj = {
      test: 'test',
      properties: {
        test: {
          type: 'string'
        }
      }
    };
    schema = {
      type: 'object',
      example: obj
    };
    result = sample(schema);
    expected = obj;
    expect(result).to.deep.equal(obj);
  });
  it('should use falsy example', () => {
    schema = {
      type: 'string',
      example: false
    };
    result = sample(schema);
    expected = false;
    expect(result).to.deep.equal(expected);
  });
  it('should use enum', () => {
    const enumList = ['test1', 'test2'];
    schema = {
      type: 'string',
      enum: enumList
    };
    result = sample(schema);
    expect(result).to.be.oneOf(enumList);
  });
});
