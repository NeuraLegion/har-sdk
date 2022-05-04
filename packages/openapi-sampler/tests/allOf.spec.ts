import { sample, Schema } from '../src';

describe('AllOf', () => {
  it('should sample schema with allOf', () => {
    const schema = {
      allOf: [
        {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              default: 'string'
            }
          }
        },
        {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              default: 1
            }
          }
        }
      ]
    };
    const result = sample(schema);
    const expected = {
      title: 'string',
      amount: 1
    };
    expect(result).toEqual(expected);
  });

  it('should throw for schemas with allOf with different types', () => {
    const schema = {
      allOf: [
        {
          type: 'string'
        },
        {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              default: 1
            }
          }
        }
      ]
    };
    expect(() => sample(schema)).toThrowError();
  });

  it('deep array', () => {
    const schema = {
      allOf: [
        {
          type: 'object',
          properties: {
            arr: {
              type: 'array',
              items: {
                type: 'object'
              }
            }
          }
        },
        {
          type: 'object',
          properties: {
            arr: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      ]
    };

    const result = sample(schema);
    expect(result.arr).toBeInstanceOf(Array);
  });

  it('should return array of at least two numbers after allOf merge', () => {
    const schema = {
      allOf: [
        {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        {
          minItems: 2,
          maxItems: 3
        }
      ]
    };

    const result = sample(schema);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toEqual(2);
  });

  it('should create an array of strings', () => {
    const schema = {
      allOf: [
        {
          type: 'array',
          items: {
            type: 'number'
          }
        },
        {
          minItems: 2,
          maxItems: 3
        },
        {
          type: 'array',
          items: {
            type: 'string'
          },
          minItems: 3
        }
      ]
    };
    const result = sample(schema);

    expect(result.length).toEqual(3);
    expect(typeof result[0]).toBe('string');
  });

  it('should not be confused by subschema without type', () => {
    const schema = {
      type: 'string',
      allOf: [
        {
          description: 'test'
        }
      ]
    };
    const result = sample(schema);
    expect(typeof result).toBe('string');
  });

  it('should not throw for array allOf', () => {
    const schema = {
      type: 'array',
      allOf: [
        {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      ]
    };
    const result = sample(schema);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should sample schema with allOf even if some type is not specified', () => {
    let schema: Schema = {
      properties: {
        title: {
          type: 'string',
          default: 'string'
        }
      },
      allOf: [
        {
          type: 'object',
          properties: {
            amount: {
              type: 'number',
              default: 1
            }
          }
        }
      ]
    };
    let result = sample(schema);
    const expected = {
      title: 'string',
      amount: 1
    };
    expect(result).toEqual(expected);

    schema = {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          default: 'string'
        }
      },
      allOf: [
        {
          properties: {
            amount: {
              type: 'number',
              default: 1
            }
          }
        }
      ]
    } as unknown as Schema;
    result = sample(schema);
    expect(typeof result.title).toBe('string');
    expect(result.amount).toEqual(1);
  });

  it('should merge deep properties', () => {
    const schema = {
      type: 'object',
      allOf: [
        {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                child1: {
                  type: 'string'
                }
              }
            }
          }
        },
        {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                child2: {
                  type: 'number'
                }
              }
            }
          }
        }
      ]
    };

    const result = sample(schema);

    expect(typeof result.parent.child1).toBe('string');
    expect(typeof result.parent.child2).toBe('number');
  });
});
