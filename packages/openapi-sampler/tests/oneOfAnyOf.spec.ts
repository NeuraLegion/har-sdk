import { sample } from '../src';
import 'chai/register-should';

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
    (typeof result).should.be.oneOf(['string', 'number']);
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
    (typeof result).should.be.oneOf(['string', 'number']);
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
    result.should.be.a('number');
  });
});
