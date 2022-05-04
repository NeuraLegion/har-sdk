import { sample } from '../src';

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
    expect(result.a >= 10).toEqual(true);
    expect(typeof result.b).toBe('string');
  });
});
