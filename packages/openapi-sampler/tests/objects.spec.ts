import { sample } from '../src';
import { Schema } from '../src/traverse';

describe('Objects', () => {
  it('should sample object without properties', () => {
    const schema = {
      type: 'object'
    };
    const result = sample(schema);
    expect(result).toEqual({});
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
    expect(typeof result.title).toBe('string');
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
    expect(result).toEqual({
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
    expect(result).toEqual({
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
    expect(typeof result.test).toBe('string');
    expect(typeof result.property1).toBe('number');
    expect(typeof result.property2).toBe('number');
  });
});
