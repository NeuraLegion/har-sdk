import { sample } from '../src';

describe('oneOf and anyOf', () => {
  it('should support oneOf', () => {
    const schema = {
      oneOf: [
        {
          type: 'string'
        },
        {
          type: 'number'
        }
      ]
    };
    const result = sample(schema);
    expect(typeof result).toBe('string');
  });

  it('should support anyOf', () => {
    const schema = {
      anyOf: [
        {
          type: 'string'
        },
        {
          type: 'number'
        }
      ]
    };
    const result = sample(schema);
    expect(typeof result).toBe('string');
  });

  it('should prefer oneOf if anyOf and oneOf are on the same level ', () => {
    const schema = {
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
    const result = sample(schema);
    expect(typeof result).toBe('number');
  });
});
