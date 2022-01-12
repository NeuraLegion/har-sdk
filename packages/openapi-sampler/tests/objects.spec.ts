import { sample } from '../src';
import { Schema } from '../src/traverse';
import 'chai/register-should';

describe('Objects', () => {
  it('should sample object without properties', () => {
    const schema = {
      type: 'object'
    };
    const result = sample(schema);
    result.should.deep.equal({});
  });

  it('should sample object with property', () => {
    const schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string'
        }
      }
    };
    const result = sample(schema);
    result.title.should.be.a('string');
  });

  it('should sample object with property with default value', () => {
    const schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'Example'
        }
      }
    } as Schema;
    const result = sample(schema);
    result.should.deep.equal({
      title: 'Example'
    });
  });

  it('should sample object with more than one property', () => {
    const schema = {
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
    const result = sample(schema);
    result.should.deep.equal({
      title: 'Example',
      amount: 10
    });
  });

  it('should sample both properties and additionalProperties', () => {
    const schema = {
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
    const result = sample(schema);
    result.test.should.be.a('string');
    result.property1.should.be.a('number');
    result.property2.should.be.a('number');
  });
});
