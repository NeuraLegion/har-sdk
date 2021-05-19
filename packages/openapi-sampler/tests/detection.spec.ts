import { sample } from '../src';
import { Schema } from '../src/traverse';
import { expect } from 'chai';

describe('Detection', () => {
  let schema: Schema;
  let result;

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
