import { sample } from '../src';
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('AllOf', () => {
  let schema: Schema;
  let result;
  let expected;

  it('should sample schema with allOf', () => {
    schema = {
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
    result = sample(schema);
    expected = {
      title: 'string',
      amount: 1
    };
    expect(result).to.deep.equal(expected);
  });

  it('should throw for schemas with allOf with different types', () => {
    schema = {
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
    } as Schema;
    expect(() => sample(schema)).to.throw();
  });

  it('deep array', () => {
    schema = {
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

    expected = {
      arr: [
        {
          name: 'string'
        }
      ]
    };
    result = sample(schema);
    expect(Array.isArray(result.arr)).to.equal(true);
  });

  it('should return array of at least two numbers after allOf merge', () => {
    schema = {
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

    result = sample(schema);
    expect(Array.isArray(result)).to.be.equal(true);
    expect(result.length).to.be.equal(2);
  });

  it('should create an array of strings', () => {
    schema = {
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
    result = sample(schema);

    expect(result.length).to.be.equal(3);
    expect(typeof result[0]).to.be.equal('string');
  });

  it('should not be confused by subschema without type', () => {
    schema = {
      type: 'string',
      allOf: [
        {
          description: 'test'
        }
      ]
    };
    result = sample(schema);
    // expected = 'string';
    expect(typeof result).to.equal('string');
  });

  it('should not throw for array allOf', () => {
    schema = {
      type: 'array',
      allOf: [
        {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      ]
    } as Schema;
    result = sample(schema);
    expect(result).to.be.an('array');
  });

  it('should sample schema with allOf even if some type is not specified', () => {
    schema = {
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
    } as Schema;
    result = sample(schema);
    expected = {
      title: 'string',
      amount: 1
    };
    expect(result).to.deep.equal(expected);

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
    } as Schema;
    result = sample(schema);
    expect(typeof result.title).to.equal('string');
    expect(result.amount).to.equal(1);
  });

  it('should merge deep properties', () => {
    schema = {
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

    result = sample(schema);

    expect(typeof result.parent.child1).to.equal('string');
    expect(typeof result.parent.child2).to.equal('number');
  });
});
