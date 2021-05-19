import { sample } from '../src';
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('Objects', () => {
  let schema: Schema;
  let result;
  let expected;

  it('should sample object without properties', () => {
    schema = {
      type: 'object'
    };
    result = sample(schema);
    expected = {};
    expect(result).to.deep.equal(expected);
  });
  it('should sample object with property', () => {
    schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string'
        }
      }
    };
    result = sample(schema);
    expect(typeof result.title).to.deep.equal('string');
  });
  it('should sample object with property with default value', () => {
    schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'Example'
        }
      }
    } as Schema;
    result = sample(schema);
    expected = {
      title: 'Example'
    };
    expect(result).to.deep.equal(expected);
  });
  it('should sample object with more than one property', () => {
    schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'Example'
        },
        amount: {
          type: 'number',
          default: 10
        }
      }
    } as Schema;
    result = sample(schema);
    expected = {
      title: 'Example',
      amount: 10
    };
    expect(result).to.deep.equal(expected);
  });
  it('should sample both properties and additionalProperties', () => {
    schema = {
      type: 'object',
      properties: {
        test: {
          type: 'string'
        }
      },
      additionalProperties: {
        type: 'number'
      }
    };
    result = sample(schema);
    expected = {
      property1: 0,
      property2: 0
    };
    expect(typeof result.test).to.equal('string');
    expect(typeof result.property1).to.equal('number');
    expect(typeof result.property2).to.equal('number');
  });
});
