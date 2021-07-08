import { sample, Schema } from '../src';
import 'chai/register-should';

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
    result.should.deep.equal(expected);
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
    (() => sample(schema)).should.throw();
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
    result.arr.should.be.instanceOf(Array);
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
    result.should.be.instanceOf(Array);
    result.length.should.equal(2);
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

    result.length.should.equal(3);
    result[0].should.be.a('string');
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
    result.should.be.a('string');
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
    result.should.be.an('array');
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
    result.should.deep.equal(expected);

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
    result.title.should.a('string');
    result.amount.should.equal(1);
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

    result.parent.child1.should.a('string');
    result.parent.child2.should.a('number');
  });
});
