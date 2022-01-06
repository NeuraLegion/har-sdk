import { sample } from '../src';
import 'chai/register-should';

describe('Detection', () => {
  it('should detect autodetect types based on props', () => {
    const schema = {
      properties: {
        a: {
          minimum: 10
        },
        b: {
          minLength: 1
        }
      }
    };
    const result = sample(schema);
    (result.a >= 10).should.equal(true);
    result.b.should.be.a('string');
  });
});
