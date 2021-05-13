import { sample } from '../src';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('Integration', () => {
  let schema: Schema;
  let result;
  let expected;

  describe('Primitives', () => {
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

  describe('Objects', () => {
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

  describe('AllOf', () => {
    // it('should sample schema with allOf', () => {
    //   schema = {
    //     'allOf': [
    //       {
    //         'type': 'object',
    //         'properties': {
    //           'title': {
    //             'type': 'string',
    //             'default': 'string'
    //           }
    //         }
    //       },
    //       {
    //         'type': 'object',
    //         'properties': {
    //           'amount': {
    //             'type': 'number',
    //             'default': 1
    //           }
    //         }
    //       }
    //     ]
    //   };
    //   result = sample(schema);
    //   expected = {
    //     'title': 'string',
    //     'amount': 1
    //   };
    //   expect(result).to.deep.equal(expected);
    // });

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

    // it('deep array', () => {
    //   schema = {
    //     'allOf': [
    //       {
    //         'type': 'object',
    //         'properties': {
    //           'arr': {
    //             'type': 'array',
    //             'items': {
    //               'type': 'object',
    //             }
    //           }
    //         }
    //       },
    //       {
    //         'type': 'object',
    //         'properties': {
    //           'arr': {
    //             'type': 'array',
    //             'items': {
    //               'type': 'object',
    //               'properties': {
    //                 'name': {
    //                   'type': 'string'
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       },
    //     ]
    //   };

    //   expected = {
    //     arr: [
    //       {
    //         name: 'string'
    //       }
    //     ]
    //   };
    //   result = sample(schema);
    //   expect(Array.isArray(result.arr)).to.equal(true);
    // });

    // it('should return array of at least two numbers after allOf merge', () => {
    //   schema = {
    //     allOf: [
    //       {
    //         'type': 'array',
    //         'items': {
    //           'type': 'number'
    //         }
    //       },
    //       {
    //         'minItems': 2,
    //         'maxItems': 3
    //       }
    //     ]
    //   };

    //   result = sample(schema);
    //   expect(Array.isArray(result)).to.be.equal(true);
    //   expect(result.length).to.be.equal(2);
    // });

    // it('should create an array of strings', () => {
    //   schema = {
    //     allOf: [
    //       {
    //         'type': 'array',
    //         'items': {
    //           'type': 'number'
    //         }
    //       },
    //       {
    //         'minItems': 2,
    //         'maxItems': 3
    //       },
    //       {
    //         'type': 'array',
    //         'items': {
    //           'type': 'string'
    //         },
    //         'minItems': 3
    //       }
    //     ]
    //   };
    //   result = sample(schema);

    //   expect(result.length).to.be.equal(3);
    //   expect(typeof result[0]).to.be.equal('string');
    // });

    // it('should not be confused by subschema without type', () => {
    //   schema = {
    //     'type': 'string',
    //     'allOf': [
    //       {
    //         'description': 'test'
    //       }
    //     ]
    //   };
    //   result = sample(schema);
    //   // expected = 'string';
    //   expect(typeof result).to.equal('string');
    // });

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

    // it('should sample schema with allOf even if some type is not specified', () => {
    //   schema = {
    //     'properties': {
    //       'title': {
    //         'type': 'string',
    //         'default': 'string'
    //       }
    //     },
    //     'allOf': [
    //       {
    //         'type': 'object',
    //         'properties': {
    //           'amount': {
    //             'type': 'number',
    //             'default': 1
    //           }
    //         }
    //       }
    //     ]
    //   } as OAPISampler.Schema;
    //   result = sample(schema);
    //   expected = {
    //     'title': 'string',
    //     'amount': 1
    //   };
    //   expect(result).to.deep.equal(expected);

    //   schema = {
    //     'type': 'object',
    //     'properties': {
    //       'title': {
    //         'type': 'string',
    //         'default': 'string'
    //       }
    //     },
    //     'allOf': [
    //       {
    //         'properties': {
    //           'amount': {
    //             'type': 'number',
    //             'default': 1
    //           }
    //         }
    //       }
    //     ]
    //   } as OAPISampler.Schema;
    //   result = sample(schema);
    //   expect(typeof result.title).to.equal('string');
    //   expect(result.amount).to.equal(1);
    // });

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

  describe('Example', () => {
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

  describe('Detection', () => {
    it('should detect autodetect types based on props', () => {
      schema = {
        properties: {
          a: {
            minimum: 10
          },
          b: {
            minLength: 1
          }
        }
      };
      result = sample(schema);
      expect(result.a > 10).to.equal(true);
      expect(typeof result.b).to.equal('string');
    });
  });

  describe('oneOf and anyOf', () => {
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

  describe('$refs', () => {
    // it('should follow $ref', () => {
    //   schema = {
    //     $ref: '#/defs/Schema'
    //   };
    //   const spec = {
    //     defs: {
    //       Schema: {
    //         type: 'object',
    //         properties: {
    //           a: {
    //             type: 'string'
    //           }
    //         }
    //       }
    //     }
    //   };
    //   result = sample(schema, {}, spec);
    //   expect(typeof result.a).to.equal('string');
    // });

    // it('should not follow circular $ref', function () {
    //   schema = {
    //     $ref: '#/defs/Schema'
    //   };
    //   const spec = {
    //     defs: {
    //       str: {
    //         type: 'string'
    //       },
    //       Schema: {
    //         type: 'object',
    //         properties: {
    //           a: {
    //             $ref: '#/defs/str'
    //           },
    //           b: {
    //             $ref: '#/defs/Schema'
    //           }
    //         }
    //       }
    //     }
    //   };
    //   result = sample(schema, {}, spec);
    //   expect(result.b).to.deep.equal({});
    //   expect(typeof result.a).to.equal('string');
    // });

    // it('should not follow circular $ref if more than one in properties', () => {
    //   schema = {
    //     $ref: '#/defs/Schema'
    //   };
    //   const spec = {
    //     defs: {
    //       Schema: {
    //         type: 'object',
    //         properties: {
    //           a: {
    //             $ref: '#/defs/Schema'
    //           },
    //           b: {
    //             $ref: '#/defs/Schema'
    //           }
    //         }
    //       }
    //     }
    //   };
    //   result = sample(schema, {}, spec);
    //   expected = {
    //     a: {},
    //     b: {}
    //   };
    //   expect(result).to.deep.equal(expected);
    // });

    it('should throw if schema has $ref and spec is not provided', () => {
      schema = {
        $ref: '#/defs/Schema'
      };

      expect(() => sample(schema)).to.throw(
        /You must provide specification in the third parameter/
      );
    });

    // it('should ignore readOnly params if referenced', () => {
    //   schema = {
    //     type: 'object',
    //     properties: {
    //       a: {
    //         allOf: [
    //           { $ref: '#/defs/Prop' }
    //         ],
    //         description: 'prop A'
    //       },
    //       b: {
    //         type: 'string'
    //       }
    //     }
    //   };

    //   const spec = {
    //     defs: {
    //       Prop: {
    //         type: 'string',
    //         readOnly: true
    //       }
    //     }
    //   };

    //   result = sample(schema, { skipReadOnly: true }, spec);
    //   expect(typeof result.b).to.deep.equal('string');
    // });
  });
});
